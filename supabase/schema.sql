-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create table if not exists trades (
  id              bigserial primary key,
  ticker          text not null,
  company         text,
  type            text not null,
  range           text,
  min_amount      bigint,
  max_amount      bigint,
  trade_date      date not null,
  filed_date      date,
  late            boolean default false,
  fetched_at      timestamptz default now(),
  unique (ticker, trade_date, type)
);

create table if not exists subscribers (
  id              bigserial primary key,
  phone           text unique not null,
  subscribed_at   timestamptz default now(),
  active          boolean default true
);

create table if not exists trump_effect_stories (
  id              bigserial primary key,
  ticker          text not null,
  company         text,
  trade_date      date,
  statement       text,
  statement_date  date,
  price_before    numeric,
  price_after     numeric,
  pct_change      numeric,
  headline        text,
  news_url        text,
  src_note        text
);

insert into trump_effect_stories
  (ticker, company, trade_date, statement, statement_date, price_before, price_after, pct_change, headline, news_url, src_note)
values
  ('DELL','Dell Technologies','2026-02-10',
   'At a White House Mother''s Day event on May 8, 2026, Trump thanked Michael Dell by name then told attendees to "go buy Dell." The stock surged 14.6% that day, hitting a record high of $263.99.',
   '2026-05-08', 134.00, 263.99, 96.0,
   'Trump bought DELL Feb 10 ($1M–$5M) → told Americans to ''go buy Dell'' May 8 → stock +96% cumulative',
   'https://www.cnbc.com/2026/05/15/trump-stock-trade-tech-oge.html',
   'Source: CNBC / TheStreet / HTX'),
  ('INTC','Intel Corporation','2026-03-05',
   'Trump began buying Intel in batches in early March 2026 — all marked "unsolicited." The U.S. government had taken a 9.9% stake in Intel in August 2025. Intel stock surged 150% after the purchases.',
   '2026-03-15', 21.00, 52.50, 150.0,
   'Trump bought Intel batches starting March — stock surged 150% amid gov''t 9.9% stake backdrop',
   'https://www.thestreet.com/investing/stocks/trump-brokerage-bought-broadcom-synopsys-dell-intel-in-q1',
   'Source: HTX.com / TheStreet'),
  ('PLTR','Palantir Technologies','2026-03-01',
   'Palantir secured major federal AI contracts during the same period Trump held a $500K–$1M position.',
   '2026-03-20', 85.00, 102.00, 20.0,
   'Palantir awarded federal AI contracts while Trump held $500K–$1M position — stock +20%',
   'https://www.quiverquant.com/news/Trump+Discloses+Large+Stock+Purchases+in+Nvidia,+Robinhood,+Palantir+and+Other+Tech+Firms',
   'Source: Quiver Quantitative')
on conflict do nothing;

alter table trades enable row level security;
alter table subscribers enable row level security;
alter table trump_effect_stories enable row level security;

create policy "public read trades" on trades for select using (true);
create policy "public read stories" on trump_effect_stories for select using (true);
