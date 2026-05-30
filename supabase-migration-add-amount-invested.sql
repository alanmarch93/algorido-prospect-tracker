-- Run this in Supabase SQL Editor if you already have the prospects table
alter table prospects add column if not exists amount_invested numeric(12,2) default null;
