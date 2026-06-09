-- 0001_schema.sql — Evolve Wholesale core schema (used-phone wholesale)
-- Unit-level device model: one row = one physical phone (unique IMEI).
-- Money is numeric(10,2). updated_at maintained by trigger.

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------- Enums ----------
create type device_grade     as enum ('A+','A','B+','B','C');
create type device_status    as enum ('available','reserved','sold');
create type blacklist_status as enum ('unknown','clean','blacklisted');
create type order_status     as enum ('pending','approved','on_the_way','delivered','denied');
create type payment_method   as enum ('cash','card');

-- ---------- updated_at helper ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------- devices (one row = one physical phone) ----------
create table devices (
  id               uuid primary key default gen_random_uuid(),
  imei             text not null unique check (imei ~ '^[0-9]{15}$'),
  brand            text not null,
  model            text not null,
  storage          text,
  color            text,
  carrier          text,
  grade            device_grade not null,
  battery_health   int check (battery_health between 0 and 100),
  price            numeric(10,2) not null check (price >= 0),
  cost             numeric(10,2) check (cost >= 0),               -- admin-only, never public
  stock            int not null default 1 check (stock between 0 and 1),
  is_local         boolean not null default true,
  condition_notes  text,
  status           device_status not null default 'available',
  blacklist_status blacklist_status not null default 'unknown',   -- cached IMEI.org result
  imei_checked_at  timestamptz,
  archived_at      timestamptz,                                   -- soft delete
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger devices_set_updated_at before update on devices
  for each row execute function set_updated_at();

create index devices_local_idx  on devices (is_local) where is_local and archived_at is null;
create index devices_brand_idx  on devices (brand);
create index devices_model_idx  on devices (model);
create index devices_grade_idx  on devices (grade);
create index devices_status_idx on devices (status);

-- ---------- order number sequence (EW-10001, EW-10002, ...) ----------
create sequence order_number_seq start 10001;

-- ---------- orders ----------
create table orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique default ('EW-' || nextval('order_number_seq')),
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  customer_address text not null,
  payment_method   payment_method not null default 'cash',
  status           order_status not null default 'pending',
  subtotal         numeric(10,2) not null check (subtotal >= 0),
  delivery_fee     numeric(10,2) not null default 0,              -- stays 0 (free local delivery)
  tax              numeric(10,2) not null default 0,              -- stays 0 (resale-exempt B2B)
  total            numeric(10,2) not null check (total >= 0),
  denial_reason    text,
  idempotency_key  text unique,                                   -- dedupe double-submit
  email_sent_at    timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();

create index orders_status_idx on orders (status, created_at desc);
create index orders_email_idx  on orders (lower(customer_email));

-- ---------- order_items (snapshots so history survives device edits/archival) ----------
create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  device_id    uuid not null references devices(id) on delete restrict,
  quantity     int not null default 1 check (quantity > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  device_brand text not null,
  device_model text not null,
  device_imei  text not null
);

create index order_items_order_idx  on order_items (order_id);
create index order_items_device_idx on order_items (device_id);

-- ---------- order status-transition guard ----------
-- pending → approved|denied ; approved → on_the_way ; on_the_way → delivered
-- delivered & denied are terminal.
create or replace function check_order_status_transition()
returns trigger language plpgsql as $$
begin
  if new.status = old.status then
    return new;
  end if;
  if not (
    (old.status = 'pending'    and new.status in ('approved','denied')) or
    (old.status = 'approved'   and new.status = 'on_the_way') or
    (old.status = 'on_the_way' and new.status = 'delivered')
  ) then
    raise exception 'Illegal order status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger orders_status_guard before update of status on orders
  for each row execute function check_order_status_transition();
