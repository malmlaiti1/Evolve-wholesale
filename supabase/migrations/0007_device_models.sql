-- 0007_device_models.sql
-- Two-level model: a category (device_models = brand + model) that individual
-- phones (devices) belong to. Brand + model move onto the category; everything
-- per-unit (storage, color, IMEI, battery, grade, price, cost, status) stays on devices.

-- 1. Category table
create table device_models (
  id          uuid primary key default gen_random_uuid(),
  brand       text not null,
  model       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index device_models_identity on device_models (brand, model);
create trigger device_models_set_updated_at before update on device_models
  for each row execute function set_updated_at();

-- 2. Link devices to a category
alter table devices add column model_id uuid references device_models(id) on delete restrict;

-- 3. Backfill categories from existing devices, then link
insert into device_models (brand, model)
  select distinct brand, model from devices;
update devices d set model_id = m.id
  from device_models m where m.brand = d.brand and m.model = d.model;
alter table devices alter column model_id set not null;
create index devices_model_id_idx on devices (model_id);

-- 4. Drop the moved columns (recreate the public view first — it depends on them)
drop view if exists devices_public;
alter table devices drop column brand;
alter table devices drop column model;

-- 5. Recreate the column-safe public view, now joining the category
create view devices_public with (security_invoker = true) as
select d.id, d.model_id, m.brand, m.model, d.storage, d.color, d.carrier, d.grade,
       d.battery_health, d.price, d.stock, d.is_local, d.condition_notes, d.status,
       d.created_at, d.updated_at
from devices d
join device_models m on m.id = d.model_id
where d.is_local = true;

-- 6. Grants + RLS so anon can read the catalog (categories are public; the
--    invoker view needs column access to model_id on devices + the category).
grant select (model_id) on devices to anon, authenticated;
grant select on device_models to anon, authenticated;
alter table device_models enable row level security;
drop policy if exists device_models_public_read on device_models;
create policy device_models_public_read on device_models
  for select to anon, authenticated using (true);
grant select on devices_public to anon, authenticated;

-- 7. create_order snapshots brand/model from the category now
create or replace function create_order(
  p_items jsonb,
  p_customer jsonb,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing    orders%rowtype;
  v_item        jsonb;
  v_device      devices%rowtype;
  v_device_ids  uuid[] := '{}';
  v_subtotal    numeric(10,2) := 0;
  v_changed     jsonb := '[]'::jsonb;
  v_unavailable jsonb := '[]'::jsonb;
  v_order       orders%rowtype;
begin
  if p_idempotency_key is not null then
    select * into v_existing from orders where idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object('status','ok','duplicate',true,'order',to_jsonb(v_existing));
    end if;
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('status','empty');
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_device from devices
      where id = (v_item->>'device_id')::uuid
      for update;

    if not found then
      v_unavailable := v_unavailable || jsonb_build_object('device_id', v_item->>'device_id', 'reason','not_found');
      continue;
    end if;

    if v_device.status <> 'available' or v_device.stock < 1
       or v_device.archived_at is not null or v_device.is_local = false then
      v_unavailable := v_unavailable || jsonb_build_object('device_id', v_device.id, 'reason','unavailable');
      continue;
    end if;

    if (v_item ? 'expected_price') and (v_item->>'expected_price') is not null
       and round((v_item->>'expected_price')::numeric, 2) <> v_device.price then
      v_changed := v_changed || jsonb_build_object(
        'device_id', v_device.id, 'current_price', v_device.price,
        'expected_price', round((v_item->>'expected_price')::numeric,2));
      continue;
    end if;

    v_device_ids := array_append(v_device_ids, v_device.id);
    v_subtotal := v_subtotal + v_device.price;
  end loop;

  if jsonb_array_length(v_changed) > 0 then
    return jsonb_build_object('status','price_changed','items',v_changed);
  end if;
  if jsonb_array_length(v_unavailable) > 0 then
    return jsonb_build_object('status','unavailable','items',v_unavailable);
  end if;

  begin
    insert into orders (customer_name, customer_email, customer_phone, customer_address,
                        payment_method, status, subtotal, delivery_fee, tax, total, idempotency_key)
    values (p_customer->>'name', p_customer->>'email', p_customer->>'phone', p_customer->>'address',
            'cash', 'pending', v_subtotal, 0, 0, v_subtotal, p_idempotency_key)
    returning * into v_order;
  exception when unique_violation then
    select * into v_existing from orders where idempotency_key = p_idempotency_key;
    return jsonb_build_object('status','ok','duplicate',true,'order',to_jsonb(v_existing));
  end;

  insert into order_items (order_id, device_id, quantity, unit_price, device_brand, device_model, device_imei)
  select v_order.id, d.id, 1, d.price, m.brand, m.model, d.imei
  from devices d join device_models m on m.id = d.model_id
  where d.id = any(v_device_ids);

  update devices set status = 'sold', stock = 0 where id = any(v_device_ids);

  return jsonb_build_object('status','ok','order',to_jsonb(v_order));
end;
$$;
