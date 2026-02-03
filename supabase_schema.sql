
-- 1. Appointments Table (Replaces '3289uriu2903u90')
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  patientName text,
  phone text,
  date text,
  time text,
  reason text,
  status text default 'pending', -- 'pending', 'confirmed', 'cancelled'
  timestamp bigint,
  created_at timestamp with time zone default timezone('utc', now())
);

-- 2. Sessions Table (Replaces 'voice_agent_sessions')
create table sessions (
  id uuid default uuid_generate_v4() primary key,
  patientName text,
  lastMessage text,
  lastMessageTime timestamp with time zone default timezone('utc', now()),
  status text default 'active', -- 'active', 'completed', 'waiting_for_doctor', 'doctor_responding'
  created_at timestamp with time zone default timezone('utc', now())
);

-- 3. Messages Table (Replaces 'voice_agent_sessions/{id}/messages')
create table messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade,
  speaker text, -- 'user', 'agent', 'doctor'
  text text,
  timestamp bigint,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable Realtime for these tables
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table messages;
