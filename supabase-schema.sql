-- RecruitTracker Database Schema
-- Run this in Supabase SQL Editor

-- Enable RLS
alter database postgres set "app.settings.jwt_secret" to 'your-jwt-secret';

-- Contacts (Coverage Book)
create table contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  firm text not null,
  title text,
  email text,
  phone text,
  linkedin_url text,
  tags text[] default '{}',
  notes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Calendar Events
create table events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  google_event_id text,
  title text not null,
  description text,
  firm text,
  event_type text check (event_type in ('coffee', 'info-session', 'phone-screen', 'first-round', 'superday', 'follow-up')),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no-show')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Event-Contact Junction
create table event_contacts (
  event_id uuid references events on delete cascade,
  contact_id uuid references contacts on delete cascade,
  primary key (event_id, contact_id)
);

-- Notes (Hierarchical)
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  parent_id uuid references notes on delete cascade,
  contact_id uuid references contacts on delete set null,
  event_id uuid references events on delete set null,
  is_folder boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Application Pipeline
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  firm text not null,
  role text not null,
  location text,
  status text default 'applied' check (status in ('applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'rejected', 'withdrawn', 'accepted')),
  applied_date date,
  deadline_date date,
  offer_deadline date,
  compensation text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on all tables
alter table contacts enable row level security;
alter table events enable row level security;
alter table notes enable row level security;
alter table applications enable row level security;
alter table event_contacts enable row level security;

-- RLS Policies - Users can only see their own data
create policy "Users can only see their own contacts" on contacts for all using (auth.uid() = user_id);
create policy "Users can only see their own events" on events for all using (auth.uid() = user_id);
create policy "Users can only see their own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can only see their own applications" on applications for all using (auth.uid() = user_id);
create policy "Users can only see their own event_contacts" on event_contacts for all using (
  exists (select 1 from events where id = event_contacts.event_id and user_id = auth.uid())
);

-- Indexes for performance
create index idx_contacts_user_firm on contacts(user_id, firm);
create index idx_contacts_user_name on contacts(user_id, name);
create index idx_events_user_start on events(user_id, start_time);
create index idx_notes_user_parent on notes(user_id, parent_id);
create index idx_applications_user_status on applications(user_id, status);