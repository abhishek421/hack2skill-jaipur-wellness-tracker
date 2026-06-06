-- Copy and run this script in your Supabase SQL Editor to seed 7 days of historical presentation data
-- for the account 'wellnesstester@gmail.com'.

do $$
declare
  v_user_id uuid;
  v_ci_id uuid;
begin
  -- 1. Retrieve the user ID
  select id into v_user_id from auth.users where email = 'wellnesstester@gmail.com';
  
  if v_user_id is null then
    raise exception 'User wellnesstester@gmail.com not found. Please register or create this user first.';
  end if;

  raise notice 'Seeding data for user ID: %', v_user_id;

  -- 2. Clean up existing data for a clean slate
  delete from check_ins where user_id = v_user_id;
  delete from wellness_actions where user_id = v_user_id;
  delete from weekly_summaries where user_id = v_user_id;

  -- =========================================================================
  -- DAY 1: 6 Days Ago
  -- =========================================================================
  insert into check_ins (user_id, mood, stress_level, energy_level, created_at)
  values (v_user_id, 4, 2, 4, now() - interval '6 days')
  returning id into v_ci_id;

  insert into reflections (check_in_id, content)
  values (v_ci_id, 'Had a productive study session today. Feeling quite good about my progress.');

  insert into wellness_actions (user_id, insight, recommendation, generated_at)
  values (v_user_id, 'You''re in a good emotional space today. Use this energy to tackle your most important tasks.', 'Complete one task under 20 minutes to build momentum.', now() - interval '6 days');

  -- =========================================================================
  -- DAY 2: 5 Days Ago
  -- =========================================================================
  insert into check_ins (user_id, mood, stress_level, energy_level, created_at)
  values (v_user_id, 3, 3, 3, now() - interval '5 days')
  returning id into v_ci_id;

  insert into triggers (check_in_id, trigger_name)
  values (v_ci_id, 'Study Backlog');

  insert into reflections (check_in_id, content)
  values (v_ci_id, 'Did not finish my targets today. Feeling a bit behind.');

  insert into wellness_actions (user_id, insight, recommendation, generated_at)
  values (v_user_id, 'You''ve reported study backlog as a source of stress today.', 'Choose just one chapter to complete today — progress beats perfection.', now() - interval '5 days');

  -- =========================================================================
  -- DAY 3: 4 Days Ago
  -- =========================================================================
  insert into check_ins (user_id, mood, stress_level, energy_level, created_at)
  values (v_user_id, 3, 3, 2, now() - interval '4 days')
  returning id into v_ci_id;

  insert into triggers (check_in_id, trigger_name)
  values (v_ci_id, 'Poor Sleep'), (v_ci_id, 'Study Backlog');

  insert into reflections (check_in_id, content)
  values (v_ci_id, 'Woke up tired. Tried to catch up on study backlog but felt sluggish.');

  insert into wellness_actions (user_id, insight, recommendation, generated_at)
  values (v_user_id, 'Low energy has appeared alongside study backlog.', 'Aim for a consistent sleep schedule tonight and avoid screens 30 minutes before bed.', now() - interval '4 days');

  -- =========================================================================
  -- DAY 4: 3 Days Ago
  -- =========================================================================
  insert into check_ins (user_id, mood, stress_level, energy_level, created_at)
  values (v_user_id, 2, 4, 2, now() - interval '3 days')
  returning id into v_ci_id;

  insert into triggers (check_in_id, trigger_name)
  values (v_ci_id, 'Exam Anxiety'), (v_ci_id, 'Poor Sleep');

  insert into reflections (check_in_id, content)
  values (v_ci_id, 'Really stressed about the mock exam. Couldn''t sleep last night.');

  insert into wellness_actions (user_id, insight, recommendation, generated_at)
  values (v_user_id, 'High stress combined with low energy can make studying feel overwhelming.', 'Take 5 slow deep breaths before your next study session.', now() - interval '3 days');

  -- =========================================================================
  -- DAY 5: 2 Days Ago
  -- =========================================================================
  insert into check_ins (user_id, mood, stress_level, energy_level, created_at)
  values (v_user_id, 2, 5, 1, now() - interval '2 days')
  returning id into v_ci_id;

  insert into triggers (check_in_id, trigger_name)
  values (v_ci_id, 'Exam Anxiety'), (v_ci_id, 'Burnout');

  insert into reflections (check_in_id, content)
  values (v_ci_id, 'Feeling completely exhausted and overwhelmed. Hard to focus.');

  insert into wellness_actions (user_id, insight, recommendation, generated_at)
  values (v_user_id, 'Your stress levels have been elevated over the last few days. Small breaks can make a big difference.', 'Give yourself permission to rest for 30 minutes without guilt today.', now() - interval '2 days');

  -- =========================================================================
  -- DAY 6: 1 Day Ago
  -- =========================================================================
  insert into check_ins (user_id, mood, stress_level, energy_level, created_at)
  values (v_user_id, 3, 3, 3, now() - interval '1 day')
  returning id into v_ci_id;

  insert into triggers (check_in_id, trigger_name)
  values (v_ci_id, 'Self-Doubt');

  insert into reflections (check_in_id, content)
  values (v_ci_id, 'Spoke with my dad. Feeling a bit better, but still doubting if I will pass.');

  insert into wellness_actions (user_id, insight, recommendation, generated_at)
  values (v_user_id, 'Exam anxiety is weighing on you today. Remember that preparation matters more than perfection.', 'Write down three things you have successfully completed this week.', now() - interval '1 day');

  -- =========================================================================
  -- DAY 7: Today
  -- =========================================================================
  insert into check_ins (user_id, mood, stress_level, energy_level, created_at)
  values (v_user_id, 4, 2, 4, now())
  returning id into v_ci_id;

  insert into reflections (check_in_id, content)
  values (v_ci_id, 'Mock exam went okay! So glad it is over. Feeling relieved.');

  insert into wellness_actions (user_id, insight, recommendation, generated_at)
  values (v_user_id, 'You''re in a good emotional space today. Use this energy to tackle your most important tasks.', 'Take a 15-minute outdoor walk to clear your mind.', now());

  raise notice 'Seeding complete successfully.';
end $$;
