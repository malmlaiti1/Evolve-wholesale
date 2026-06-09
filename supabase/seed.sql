-- seed.sql — DEV-ONLY demo inventory (used phones). NOT for production.
-- The real catalog is owner-provided via the admin add-device / IMEI flow.
-- All demo IMEIs start with '35000000000' so they are easy to identify/remove:
--   delete from devices where imei like '35000000000%';
-- Idempotent: re-running does nothing for existing IMEIs.

insert into devices (imei, brand, model, storage, color, carrier, grade, battery_health, price, cost, is_local, condition_notes) values
 ('350000000000001','Apple','iPhone 13 Pro','128GB','Graphite','Unlocked','A',  94, 560.00, 430.00, true,  'Pristine, no marks. Includes cable.'),
 ('350000000000002','Apple','iPhone 13','128GB','Midnight','Unlocked','A',      91, 480.00, 360.00, true,  'Light use, screen flawless.'),
 ('350000000000003','Apple','iPhone 12','64GB','Black','Unlocked','B',          86, 300.00, 215.00, true,  'Minor scuffs on frame, fully functional.'),
 ('350000000000004','Apple','iPhone 12','64GB','Blue','T-Mobile','B+',          88, 310.00, 220.00, true,  'Small scratch on back glass.'),
 ('350000000000005','Apple','iPhone 11','64GB','White','Unlocked','B+',         83, 230.00, 160.00, true,  'Good condition, battery serviceable.'),
 ('350000000000006','Apple','iPhone SE (2020)','64GB','Red','Unlocked','B',     80, 120.00,  80.00, true,  'Functional, visible wear.'),
 ('350000000000007','Samsung','Galaxy S22','128GB','Phantom Black','Unlocked','A',93,380.00,285.00, true,  'Excellent, no scratches.'),
 ('350000000000008','Samsung','Galaxy S21','128GB','Phantom Gray','Unlocked','B+',87,280.00,200.00, true,  'Light wear on edges.'),
 ('350000000000009','Samsung','Galaxy A53','128GB','Awesome Blue','Unlocked','A',95,190.00,135.00, true,  'Like new.'),
 ('350000000000010','Google','Pixel 7','128GB','Obsidian','Unlocked','A',       92, 330.00, 240.00, true,  'Clean, fully tested.'),
 ('350000000000011','Google','Pixel 6','128GB','Stormy Black','Unlocked','B+',  85, 250.00, 175.00, true,  'Minor corner scuff.'),
 ('350000000000012','OnePlus','OnePlus 9','128GB','Astral Black','Unlocked','B',82,260.00,185.00, true,  'Working well, some wear.'),
 ('350000000000013','Apple','iPhone 13','128GB','Starlight','Unlocked','A',     90, 485.00, 365.00, true,  'Great condition, boxed.'),
 ('350000000000014','Apple','iPhone XR','64GB','Coral','Unlocked','C',          74,  95.00,  60.00, false, 'Wholesale-only lot, not for local catalog.')
on conflict (imei) do nothing;
