-- Podium — initial schema
-- Run in the Supabase SQL editor (or via `supabase db push` with this as a migration).

create type user_role as enum ('student', 'tutor');
create type exam_level as enum ('GCSE', 'A-Level');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'student',
  level exam_level,
  created_at timestamptz not null default now()
);

-- links a tutor to their students (small team, not a marketplace)
create table tutor_students (
  tutor_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  primary key (tutor_id, student_id)
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null default 'Maths'
);

create table topic_mastery (
  student_id uuid not null references profiles(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  mastery_pct numeric not null default 0 check (mastery_pct >= 0 and mastery_pct <= 100),
  updated_at timestamptz not null default now(),
  primary key (student_id, topic_id)
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  title text not null,
  video_url text,
  revision_notes text,
  worked_example jsonb -- array of { step: number, text: string }
);

create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  title text not null,
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'ai')),
  content text not null,
  created_at timestamptz not null default now()
);

create table homework_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  assigned_by uuid references profiles(id) on delete set null,
  image_path text, -- Supabase Storage object path
  status text not null default 'pending' check (status in ('pending', 'marking', 'marked')),
  score numeric,
  max_score numeric default 20,
  steps jsonb, -- array of { title: string, correct: boolean, note: string }
  tutor_note text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table tutor_students enable row level security;
alter table topic_mastery enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table homework_submissions enable row level security;

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Students manage their own chat sessions" on chat_sessions
  for all using (auth.uid() = student_id);
create policy "Students manage their own chat messages" on chat_messages
  for all using (
    exists (select 1 from chat_sessions cs where cs.id = session_id and cs.student_id = auth.uid())
  );

create policy "Students manage their own homework" on homework_submissions
  for all using (auth.uid() = student_id);

create policy "Tutors can view their students' data" on homework_submissions
  for select using (
    exists (select 1 from tutor_students ts where ts.student_id = homework_submissions.student_id and ts.tutor_id = auth.uid())
  );
create policy "Tutors can view their students' topic mastery" on topic_mastery
  for select using (
    exists (select 1 from tutor_students ts where ts.student_id = topic_mastery.student_id and ts.tutor_id = auth.uid())
  );
create policy "Tutors can view their assigned students list" on tutor_students
  for select using (auth.uid() = tutor_id);
