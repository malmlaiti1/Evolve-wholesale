-- 0008_grade_orders.sql — order by (category, grade, quantity) at the grade price.
-- The storefront groups available units by grade and shows ONE price per grade =
-- the highest price among available units of that grade. A line buys N units of a
-- (model, grade); create_order locks the N highest-priced available units, charges
-- the grade max for all of them, and records one order_item per physical phone.

create or replace function create_order(
  p_items jsonb,
  p_customer jsonb,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_existing    orders%rowtype;
  v_line        jsonb;
  v_mid         uuid;
  v_grade       device_grade;
  v_qty         int;
  v_expected    numeric(10,2);
  v_max         numeric(10,2);
  v_ids         uuid[];
  v_dev         record;
  v_count       int;
  v_picks       jsonb := '[]'::jsonb;
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

  for v_line in select * from jsonb_array_elements(p_items)
  loop
    v_mid     := (v_line->>'model_id')::uuid;
    v_grade   := (v_line->>'grade')::device_grade;
    v_qty     := greatest(1, coalesce((v_line->>'quantity')::int, 1));
    v_expected := nullif(v_line->>'expected_price','')::numeric;

    -- Highest available price for this category + grade = the price charged per unit.
    select max(price) into v_max
    from devices
    where model_id = v_mid and grade = v_grade
      and status = 'available' and stock >= 1
      and archived_at is null and is_local = true;

    if v_max is null then
      v_unavailable := v_unavailable || jsonb_build_object(
        'model_id', v_mid, 'grade', v_grade, 'reason', 'unavailable', 'available', 0);
      continue;
    end if;

    -- Lock up to v_qty available units, highest-priced first.
    v_ids := '{}';
    for v_dev in
      select id from devices
      where model_id = v_mid and grade = v_grade
        and status = 'available' and stock >= 1
        and archived_at is null and is_local = true
      order by price desc, created_at asc
      for update skip locked
      limit v_qty
    loop
      v_ids := array_append(v_ids, v_dev.id);
    end loop;

    v_count := coalesce(array_length(v_ids, 1), 0);
    if v_count < v_qty then
      v_unavailable := v_unavailable || jsonb_build_object(
        'model_id', v_mid, 'grade', v_grade, 'reason', 'insufficient', 'available', v_count);
      continue;
    end if;

    if v_expected is not null and round(v_expected, 2) <> round(v_max, 2) then
      v_changed := v_changed || jsonb_build_object(
        'model_id', v_mid, 'grade', v_grade,
        'current_price', round(v_max, 2), 'expected_price', round(v_expected, 2));
      continue;
    end if;

    v_picks := v_picks || jsonb_build_object('ids', to_jsonb(v_ids), 'price', round(v_max, 2));
    v_subtotal := v_subtotal + round(v_max, 2) * v_qty;
  end loop;

  if jsonb_array_length(v_changed) > 0 then
    return jsonb_build_object('status', 'price_changed', 'items', v_changed);
  end if;
  if jsonb_array_length(v_unavailable) > 0 then
    return jsonb_build_object('status', 'unavailable', 'items', v_unavailable);
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

  for v_line in select * from jsonb_array_elements(v_picks)
  loop
    insert into order_items (order_id, device_id, quantity, unit_price, device_brand, device_model, device_imei)
    select v_order.id, d.id, 1, (v_line->>'price')::numeric, m.brand, m.model, coalesce(d.imei, '')
    from devices d join device_models m on m.id = d.model_id
    where d.id = any(array(select jsonb_array_elements_text(v_line->'ids'))::uuid[]);

    update devices set status = 'sold', stock = 0
    where id = any(array(select jsonb_array_elements_text(v_line->'ids'))::uuid[]);
  end loop;

  return jsonb_build_object('status', 'ok', 'order', to_jsonb(v_order));
end;
$function$;
