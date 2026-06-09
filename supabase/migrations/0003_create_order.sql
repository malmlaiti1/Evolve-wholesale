-- 0003_create_order.sql — atomic checkout RPC
-- Server-authoritative: recomputes totals from DB, locks rows, prevents double-buy and
-- price tampering. Returns a jsonb result object the API can branch on.

create or replace function create_order(
  p_items jsonb,            -- [{ "device_id": "uuid", "expected_price": 199.00 }]
  p_customer jsonb,         -- { "name","email","phone","address" }
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
  -- 1. Idempotency: return the existing order if this key was already used.
  if p_idempotency_key is not null then
    select * into v_existing from orders where idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object('status','ok','duplicate',true,'order',to_jsonb(v_existing));
    end if;
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('status','empty');
  end if;

  -- 2. Lock + validate each requested device.
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

    -- Price-change detection (client must match current DB price).
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

  -- 3. Abort (without creating) on any price change or unavailability.
  if jsonb_array_length(v_changed) > 0 then
    return jsonb_build_object('status','price_changed','items',v_changed);
  end if;
  if jsonb_array_length(v_unavailable) > 0 then
    return jsonb_build_object('status','unavailable','items',v_unavailable);
  end if;

  -- 4. Create the order (total = subtotal; delivery_fee/tax = 0).
  begin
    insert into orders (customer_name, customer_email, customer_phone, customer_address,
                        payment_method, status, subtotal, delivery_fee, tax, total, idempotency_key)
    values (p_customer->>'name', p_customer->>'email', p_customer->>'phone', p_customer->>'address',
            'cash', 'pending', v_subtotal, 0, 0, v_subtotal, p_idempotency_key)
    returning * into v_order;
  exception when unique_violation then
    -- Lost an idempotency race: return the winner.
    select * into v_existing from orders where idempotency_key = p_idempotency_key;
    return jsonb_build_object('status','ok','duplicate',true,'order',to_jsonb(v_existing));
  end;

  -- 5. Snapshot items + mark the physical units sold.
  insert into order_items (order_id, device_id, quantity, unit_price, device_brand, device_model, device_imei)
  select v_order.id, d.id, 1, d.price, d.brand, d.model, d.imei
  from devices d where d.id = any(v_device_ids);

  update devices set status = 'sold', stock = 0 where id = any(v_device_ids);

  return jsonb_build_object('status','ok','order',to_jsonb(v_order));
end;
$$;

-- Only the service-role API may call it; block anon/authenticated direct RPC.
revoke all on function create_order(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function create_order(jsonb, jsonb, text) to service_role;
