-- Podium — skill-mastery model (pilot: A-Level Maths, Integration)
-- Run AFTER schema.sql. Adds granular skills, tagged diagnostic questions,
-- attempt logging and a Bayesian Knowledge Tracing (BKT) mastery score.
-- Existing `topics` table stays as the subject grouping; skills sit under a topic.

create table skills (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  name text not null,
  description text,
  exam_board text not null default 'AQA',
  level exam_level not null default 'A-Level',
  prerequisite_skill_id uuid references skills(id) on delete set null,
  sort_order int not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table skill_questions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  secondary_skill_ids uuid[] not null default '{}',
  question_text text not null,
  image_path text,
  mark_scheme text not null,
  common_misconceptions text,
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  marks smallint not null default 1,
  status lesson_status not null default 'draft',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table question_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references skill_questions(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  correct boolean not null,
  used_hint boolean not null default false,
  student_answer text,
  created_at timestamptz not null default now()
);

create table skill_mastery (
  student_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  p_mastery numeric not null default 0.30 check (p_mastery >= 0 and p_mastery <= 1),
  attempts_count int not null default 0,
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, skill_id)
);

create or replace function record_attempt(
  p_student_id uuid,
  p_question_id uuid,
  p_correct boolean,
  p_used_hint boolean default false,
  p_student_answer text default null
) returns numeric as $$
declare
  v_skill_id uuid;
  v_prior numeric;
  v_posterior numeric;
  p_slip numeric := 0.10;
  p_guess numeric := 0.20;
  p_learn numeric := 0.15;
begin
  select skill_id into v_skill_id from skill_questions where id = p_question_id;

  insert into question_attempts (student_id, question_id, skill_id, correct, used_hint, student_answer)
  values (p_student_id, p_question_id, v_skill_id, p_correct, p_used_hint, p_student_answer);

  insert into skill_mastery (student_id, skill_id, p_mastery)
  values (p_student_id, v_skill_id, 0.30)
  on conflict (student_id, skill_id) do nothing;

  select p_mastery into v_prior from skill_mastery where student_id = p_student_id and skill_id = v_skill_id;

  if p_correct and not p_used_hint then
    v_posterior := (v_prior * (1 - p_slip)) / (v_prior * (1 - p_slip) + (1 - v_prior) * p_guess);
  elsif p_correct and p_used_hint then
    v_posterior := (v_prior * (1 - p_slip) * 0.6) / (v_prior * (1 - p_slip) * 0.6 + (1 - v_prior) * p_guess);
  else
    v_posterior := (v_prior * p_slip) / (v_prior * p_slip + (1 - v_prior) * (1 - p_guess));
  end if;

  v_posterior := v_posterior + (1 - v_posterior) * p_learn;
  v_posterior := least(greatest(v_posterior, 0.02), 0.98);

  update skill_mastery
    set p_mastery = v_posterior,
        attempts_count = attempts_count + 1,
        last_practiced_at = now(),
        updated_at = now()
    where student_id = p_student_id and skill_id = v_skill_id;

  return v_posterior;
end;
$$ language plpgsql security definer;

insert into topics (name, subject) values ('Integration', 'Maths')
  on conflict do nothing;

do $$
declare v_topic_id uuid;
begin
  select id into v_topic_id from topics where name = 'Integration' limit 1;

  insert into skills (topic_id, name, description, sort_order) values
    (v_topic_id, 'Basic integration (power rule)', 'Integrate x^n terms directly.', 1),
    (v_topic_id, 'Definite integration', 'Evaluate an integral between limits.', 2),
    (v_topic_id, 'Algebraic manipulation before integrating', 'Rearrange an expression into an integrable form before applying a rule.', 3),
    (v_topic_id, 'Integration by substitution', 'Choose and apply a substitution to simplify an integral.', 4),
    (v_topic_id, 'Recognising when integration by parts is needed', 'Identify products of functions that require integration by parts rather than another method.', 5),
    (v_topic_id, 'Executing integration by parts', 'Correctly apply the integration by parts formula once chosen.', 6),
    (v_topic_id, 'Repeated integration by parts', 'Apply integration by parts more than once within the same problem.', 7),
    (v_topic_id, 'Applying integration in unfamiliar/exam contexts', 'Use integration inside a multi-step or applied exam question (area, volume, kinematics).', 8)
  on conflict do nothing;
end $$;

alter table skills enable row level security;
alter table skill_questions enable row level security;
alter table question_attempts enable row level security;
alter table skill_mastery enable row level security;

create policy "Anyone signed in can read skills" on skills
  for select using (auth.role() = 'authenticated');
create policy "Tutors manage skills" on skills
  for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'tutor'));

create policy "Students read published questions, tutors read all" on skill_questions
  for select using (
    status = 'published'
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'tutor')
  );
create policy "Tutors manage questions" on skill_questions
  for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'tutor'));

create policy "Students manage their own attempts" on question_attempts
  for all using (auth.uid() = student_id);
create policy "Tutors view their students' attempts" on question_attempts
  for select using (
    exists (select 1 from tutor_students ts where ts.student_id = question_attempts.student_id and ts.tutor_id = auth.uid())
  );

create policy "Students manage their own mastery" on skill_mastery
  for all using (auth.uid() = student_id);
create policy "Tutors view their students' mastery" on skill_mastery
  for select using (
    exists (select 1 from tutor_students ts where ts.student_id = skill_mastery.student_id and ts.tutor_id = auth.uid())
  );