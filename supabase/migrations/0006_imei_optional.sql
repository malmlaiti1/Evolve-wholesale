-- 0006_imei_optional.sql
-- Support bulk intake: add N units of a model at once and scan each unit's IMEI
-- later. IMEI becomes optional (the unique constraint still applies to non-null
-- values; Postgres allows multiple NULLs). The format check already passes for
-- NULL, so it needs no change. Order snapshots must also allow a null IMEI.
alter table devices alter column imei drop not null;
alter table order_items alter column device_imei drop not null;
