-- 0011_product_images.sql — per-device product photos.
-- Each phone (device) gets one image. The storefront shows the photo of the
-- highest-priced available unit for the selected grade (same unit create_order
-- locks/sells first), so the image rides along with the existing grade pricing.

-- 1. Per-device image column (nullable: legacy/seed rows keep working; the admin
--    form enforces "required" for new/edited units).
alter table devices add column if not exists image_url text;

-- 2. The devices_public view is SECURITY INVOKER, so anon must hold a column-level
--    SELECT grant on every column it references — add image_url.
grant select (image_url) on devices to anon, authenticated;

-- 3. Recreate the public view with image_url (mirrors 0007's join + filter).
create or replace view devices_public with (security_invoker = true) as
select d.id, d.model_id, m.brand, m.model, d.storage, d.color, d.carrier, d.grade,
       d.battery_health, d.price, d.stock, d.is_local, d.condition_notes, d.status,
       d.image_url, d.created_at, d.updated_at
from devices d
join device_models m on m.id = d.model_id
where d.is_local = true;

grant select on devices_public to anon, authenticated;

-- 4. Public storage bucket for product photos. Uploads go through the service-role
--    admin client (bypasses RLS); reads are public so we can serve plain public URLs.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Explicit public read policy (public buckets serve via the public endpoint, but
-- keep this so signed/listing reads work for anon + authenticated too).
drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');
