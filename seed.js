const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'wellnesstester@gmail.com';
const password = 'password123';

async function seed() {
  console.log(`Authenticating as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Authentication failed:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`Authenticated user ID: ${userId}`);

  // Clean existing check-ins to prevent duplicate seeding
  console.log('Cleaning existing check-ins...');
  const { error: deleteError } = await supabase
    .from('check_ins')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Failed to clean existing check-ins:', deleteError.message);
    process.exit(1);
  }

  // Define 7 days of historical check-in data
  const data = [
    {
      daysAgo: 6,
      mood: 4,
      stress: 2,
      energy: 4,
      triggers: [],
      reflection: 'Had a productive study session today. Feeling quite good about my progress.',
      insight: "You're in a good emotional space today. Use this energy to tackle your most important tasks.",
      recommendation: 'Complete one task under 20 minutes to build momentum.',
    },
    {
      daysAgo: 5,
      mood: 3,
      stress: 3,
      energy: 3,
      triggers: ['Study Backlog'],
      reflection: 'Did not finish my targets today. Feeling a bit behind.',
      insight: "You've reported study backlog as a source of stress today.",
      recommendation: "Choose just one chapter to complete today — progress beats perfection.",
    },
    {
      daysAgo: 4,
      mood: 3,
      stress: 3,
      energy: 2,
      triggers: ['Poor Sleep', 'Study Backlog'],
      reflection: 'Woke up tired. Tried to catch up on study backlog but felt sluggish.',
      insight: 'Low energy has appeared alongside study backlog.',
      recommendation: 'Aim for a consistent sleep schedule tonight and avoid screens 30 minutes before bed.',
    },
    {
      daysAgo: 3,
      mood: 2,
      stress: 4,
      energy: 2,
      triggers: ['Exam Anxiety', 'Poor Sleep'],
      reflection: "Really stressed about the mock exam. Couldn't sleep last night.",
      insight: 'High stress combined with low energy can make studying feel overwhelming.',
      recommendation: 'Take 5 slow deep breaths before your next study session.',
    },
    {
      daysAgo: 2,
      mood: 2,
      stress: 5,
      energy: 1,
      triggers: ['Exam Anxiety', 'Burnout'],
      reflection: 'Feeling completely exhausted and overwhelmed. Hard to focus.',
      insight: 'Your stress levels have been elevated over the last few days. Small breaks can make a big difference.',
      recommendation: 'Give yourself permission to rest for 30 minutes without guilt today.',
    },
    {
      daysAgo: 1,
      mood: 3,
      stress: 3,
      energy: 3,
      triggers: ['Self-Doubt'],
      reflection: 'Spoke with my dad. Feeling a bit better, but still doubting if I will pass.',
      insight: 'Exam anxiety is weighing on you today. Remember that preparation matters more than perfection.',
      recommendation: 'Write down three things you have successfully completed this week.',
    },
    {
      daysAgo: 0,
      mood: 4,
      stress: 2,
      energy: 4,
      triggers: [],
      reflection: 'Mock exam went okay! So glad it is over. Feeling relieved.',
      insight: "You're in a good emotional space today. Use this energy to tackle your most important tasks.",
      recommendation: 'Take a 15-minute outdoor walk to clear your mind.',
    },
  ];

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  console.log('Seeding 7 days of wellness data...');

  for (const day of data) {
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() - day.daysAgo);
    const dateStr = checkInDate.toISOString();

    console.log(`Inserting check-in for ${day.daysAgo} days ago (${dateStr.split('T')[0]})...`);
    await sleep(800);

    // Insert check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        mood: day.mood,
        stress_level: day.stress,
        energy_level: day.energy,
        created_at: dateStr,
      })
      .select()
      .single();

    if (checkInError) {
      console.error(`Error inserting check-in for ${day.daysAgo} days ago:`, checkInError.message);
      continue;
    }

    await sleep(800);

    // Insert triggers
    if (day.triggers.length > 0) {
      const { error: triggerError } = await supabase.from('triggers').insert(
        day.triggers.map((t) => ({
          check_in_id: checkIn.id,
          trigger_name: t,
        }))
      );
      if (triggerError) {
        console.error(`Error inserting triggers for check-in ${checkIn.id}:`, triggerError.message);
      }
      await sleep(500);
    }

    // Insert reflection
    if (day.reflection) {
      const { error: reflectionError } = await supabase.from('reflections').insert({
        check_in_id: checkIn.id,
        content: day.reflection,
      });
      if (reflectionError) {
        console.error(`Error inserting reflection for check-in ${checkIn.id}:`, reflectionError.message);
      }
      await sleep(500);
    }

    // Insert wellness action
    const { error: actionError } = await supabase.from('wellness_actions').insert({
      user_id: userId,
      insight: day.insight,
      recommendation: day.recommendation,
      generated_at: dateStr,
    });
    if (actionError) {
      console.error(`Error inserting wellness action for ${day.daysAgo} days ago:`, actionError.message);
    }
  }

  console.log('Cleaning existing weekly summaries to force regeneration...');
  await supabase.from('weekly_summaries').delete().eq('user_id', userId);

  console.log('Seeding complete! Try refreshing the dashboard & weekly summary in your browser.');
}

seed();
