// Mock data — shaped for a future Supabase schema.
// Tables in mind: couple, mood_checkins, memories, quiz_questions, quiz_attempts,
// drawings, photo_challenges, activity.

const COUPLE = {
  id: 'couple_01',
  partner_a: { id: 'u_dhruv',  name: 'Dhruv',  initial: 'D', accent: 'coral' },
  partner_b: { id: 'u_anjali', name: 'Anjali', initial: 'A', accent: 'lavender' },
  anniversary: '2021-03-10',
  next_visit:  null,                       // TBD — wink emoji shows on Home
  cities: { a: 'San Francisco, CA', b: 'Bengaluru, IN' },
  airports: { a: 'SFO', b: 'BLR' },
};

// Quiz — five categories. Each q: id, category, prompt, options[4], answer_index, blurb_correct, blurb_wrong
const QUIZ_QUESTIONS = [
  // Memories
  { id:'q1', category:'Memories', prompt:'Which memory do I bring up the most?',
    options:['Rain on the auto ride', 'The 4am airport hug', 'Burnt pancakes morning', 'First video call cut off'],
    answer:1, hint:'It involves a terminal and bad coffee.',
    ok:'Yes — that hug ruined every other hug for me.', no:'Close, but it’s the 4am airport one.' },
  { id:'q2', category:'Memories', prompt:'Where were we when we said “this is it” for the first time?',
    options:['On a balcony', 'On a video call at 2am', 'A dosa place in Indiranagar', 'Walking back from the metro'],
    answer:1, ok:'2am, low battery, full heart.', no:'Nope — 2am call, both half-asleep.' },

  // Favorites
  { id:'q3', category:'Favorites', prompt:'What would I order if I was missing home?',
    options:['Filter coffee + idli', 'Maggi, no negotiation', 'Mom’s rasam over rice', 'Pav bhaji from that one stall'],
    answer:2, ok:'Rasam over rice. Every time.', no:'Sweet guess, but it’s rasam over rice.' },
  { id:'q4', category:'Favorites', prompt:'Which Billie Eilish song would Anjali put on during a quiet night?',
    options:['“what was I made for?”', '“TV”', '“ocean eyes”', '“BIRDS OF A FEATHER”'],
    answer:0, ok:'Yes — the quiet-night one, always.', no:'Quiet night = “what was I made for?”' },
  { id:'q5', category:'Favorites', prompt:'Which Anuv Jain song feels closest to us?',
    options:['“Husn”', '“Baarishein”', '“Gul”', '“Mishri”'],
    answer:1, ok:'Baarishein. Of course.', no:'It’s Baarishein — the rain one.' },

  // Inside Jokes
  { id:'q6', category:'Inside Jokes', prompt:'Finish the sentence: “If I had a rupee for every time you…”',
    options:['sent a blurry selfie', 'said “one sec” for twenty minutes', 'fell asleep mid-call', 'screenshot a recipe'],
    answer:1, ok:'I’d retire. Genuinely.', no:'“One sec” for twenty minutes — own it.' },
  { id:'q7', category:'Inside Jokes', prompt:'What is our agreed name for the WiFi at the dosa place?',
    options:['Sambar5G', 'ChutneyNet', 'Aunty’s_iPhone', 'PleaseConnect'],
    answer:2, ok:'Aunty’s_iPhone wins again.', no:'Aunty’s_iPhone, always.' },

  // Future Plans
  { id:'q8', category:'Future Plans', prompt:'What is our ideal first weekend together (no plans, full plans)?',
    options:['One museum, one nap, one bad movie', 'Beach. No phones.', 'Cook three meals, ignore the world', 'Drive somewhere with no destination'],
    answer:2, ok:'Three meals, world ignored.', no:'Three meals, world ignored — we said this.' },
  { id:'q9', category:'Future Plans', prompt:'First thing we buy for our future kitchen?',
    options:['A loud kettle', 'A serious knife', 'A tiny plant for the window', 'A second coffee machine'],
    answer:2, ok:'Tiny plant. Window. Non-negotiable.', no:'Tiny plant for the window — we decided.' },

  // Deep Questions
  { id:'q10', category:'Deep Questions', prompt:'What tiny thing makes me feel loved?',
    options:['A voice note before bed', 'A photo of the sky from your side', 'You sending me food pictures', 'A “got home safe” text'],
    answer:1, ok:'Yes — the sky from your side.', no:'It’s the sky photo from your side.' },
  { id:'q11', category:'Deep Questions', prompt:'When I’m quiet for too long, what do I actually need?',
    options:['Space, no questions', 'A silly photo', 'You to call, not text', 'A walk together on the phone'],
    answer:3, ok:'A walk together on the phone. Always works.', no:'A walk together on the phone — that’s the move.' },
];

const QUIZ_CATEGORIES = ['Memories', 'Favorites', 'Inside Jokes', 'Future Plans', 'Deep Questions'];

// Drawing prompts — twists for the Future Home game
const DRAW_TWISTS = [
  'add a tiny kitchen',
  'add a cozy couch',
  'add a balcony with two chairs',
  'add our dream pet',
  'add a ridiculous mailbox',
  'add a secret snack drawer',
  'put a window where the sky shows',
  'draw the doormat that says something silly',
];

const DRAW_RATINGS = [
  'architecturally questionable',
  'emotionally perfect',
  'move-in ready-ish',
  'zoning violation, but cute',
  '11/10 vibes',
  'the realtor is crying',
  'cottagecore-adjacent',
];

// Blurred photo challenges
const PHOTO_CHALLENGES = [
  {
    id:'p1',
    title:'The 4am airport',
    date:'Nov 12, 2024',
    location:'BLR → SFO terminal',
    correct:'The airport goodbye',
    options:['A late-night dosa run', 'The airport goodbye', 'New Year’s on the rooftop', 'Diwali at your parents’'],
    hint:'Fluorescent lights. We were both pretending it was fine.',
    note:'You wore the grey hoodie. I still have the boarding pass.',
    // soft gradient stand-in for a real photo
    bg: 'linear-gradient(135deg, #2A2438 0%, #5C4B7A 45%, #C99A8A 100%)',
  },
  {
    id:'p2',
    title:'Rooftop, after the call dropped',
    date:'Aug 2, 2024',
    location:'San Francisco, CA',
    correct:'Rooftop after the call dropped',
    options:['Park bench at sunset', 'Rooftop after the call dropped', 'Diner at 2am', 'Walking back from the metro'],
    hint:'It was orange. The wifi was not.',
    note:'You called back from the elevator. We just laughed for a minute.',
    bg: 'linear-gradient(135deg, #F4A66B 0%, #E08F73 40%, #6B4A3E 100%)',
  },
  {
    id:'p3',
    title:'Burnt pancakes',
    date:'Feb 18, 2025',
    location:'Your kitchen',
    correct:'The burnt pancakes morning',
    options:['Tea on the balcony', 'The burnt pancakes morning', 'Sunday market run', 'The omelette disaster'],
    hint:'There was smoke. There was also a playlist.',
    note:'You said “it’s caramelised” with a straight face.',
    bg: 'linear-gradient(135deg, #EADFC8 0%, #D9A66B 45%, #8C5A3A 100%)',
  },
  {
    id:'p4',
    title:'Monsoon walk',
    date:'Jul 9, 2025',
    location:'Bengaluru',
    correct:'The monsoon walk',
    options:['The monsoon walk', 'Coffee at Koshy’s', 'Cubbon Park afternoon', 'Auto ride in the rain'],
    hint:'Baarishein. Literally.',
    note:'My shoes never recovered. Worth it.',
    bg: 'linear-gradient(135deg, #6F8F8B 0%, #9CB6B1 50%, #2F3E45 100%)',
  },
];

// Recent activity
const ACTIVITY = [
  { id:'a1', who:'Anjali', what:'finished a Quiz round',          meta:'Favorites · 4/5', when:'2h ago', kind:'quiz' },
  { id:'a2', who:'Dhruv',  what:'drew a future home',             meta:'“architecturally questionable”', when:'yesterday', kind:'draw' },
  { id:'a3', who:'Anjali', what:'guessed a blurred photo',        meta:'The 4am airport · 1 hint', when:'2 days ago', kind:'photo' },
  { id:'a4', who:'Dhruv',  what:'sent “I miss you”',    meta:'12:42am his time',  when:'3 days ago', kind:'miss' },
  { id:'a5', who:'Both',   what:'voted for tonight’s date',  meta:'cook the same meal', when:'last week', kind:'date' },
];

// Latest memory preview
const LATEST_MEMORY = {
  title: 'The rooftop call',
  date: 'May 21, 2026',
  note: 'You held the phone up to the sky so I could see it too.',
  bg: 'linear-gradient(135deg, #E5DEF0 0%, #C8B8DD 60%, #7D6FA0 100%)',
};

// Tonight's tiny date
const TONIGHT_DATE = {
  title: 'Cook the same meal, on call',
  duration: '45–60 min',
  vibe: 'low effort, high serotonin',
  steps: ['Pick one dish you both have ingredients for', 'Open the call, prop the phone', 'Compare results at the end. No judging the burnt one.'],
};

// Soundtrack chips
const SOUNDTRACK = [
  { id:'s1', label:'Billie mood',  sub:'quiet night, low light', tone:'lavender' },
  { id:'s2', label:'Anuv evening', sub:'rain on the window',     tone:'sage' },
];

// Mood options for the home check-in
const MOODS = [
  { id:'happy',     label:'happy',       tone:'coral'    },
  { id:'tired',     label:'tired',       tone:'lavender' },
  { id:'missing',   label:'missing you', tone:'coral'    },
  { id:'excited',   label:'excited',     tone:'butter'   },
  { id:'quiet',     label:'quiet',       tone:'sage'     },
  { id:'stressed',  label:'stressed',    tone:'ink'      },
];

// Songs quiz category — add to the existing list
QUIZ_QUESTIONS.push(
  { id:'q12', category:'Songs', prompt:'What song would Dhruv send when he misses Anjali?',
    options:['“ocean eyes”', '“Baarishein”', '“Husn”', '“TV”'],
    answer:1, ok:'Baarishein, every time. He thinks he’s subtle.', no:'It’s Baarishein — he thinks he’s subtle.' },
  { id:'q13', category:'Songs', prompt:'What kind of playlist would we make for our next call?',
    options:['Loud and chaotic', 'Slow and indoor-lit', 'Pure 2014 nostalgia', 'Songs in three languages, one mood'],
    answer:3, ok:'Three languages, one mood. Our specialty.', no:'Three languages, one mood — our specialty.' },
);
QUIZ_CATEGORIES.push('Songs');

// Date night ideas — wheel sectors and a saved list
const DATE_CATEGORIES = ['Talk', 'Game', 'Create', 'Food', 'Music', 'Memory', 'Future'];

const DATE_IDEAS = [
  { id:'d1', cat:'Game',   title:'Draw our future home badly in 60 seconds',
    duration:'5 min',  mood:'silly',  materials:['phone','this app'],
    steps:['Open Future Home, Badly Drawn','One person draws, the other watches the call','Rate each other’s masterpieces'] },
  { id:'d2', cat:'Music',  title:'Make each other a 5-song playlist',
    duration:'30 min', mood:'tender', materials:['Spotify / Apple Music'],
    steps:['Pick 5 songs only','Send the link, no preview','Listen at the same time, on call'] },
  { id:'d3', cat:'Music',  title:'One Billie song, one Anuv song, for tonight',
    duration:'10 min', mood:'cozy',   materials:['headphones','your voice'],
    steps:['Pick one of each','Press play together','Stay quiet for the first verse, that’s the rule'] },
  { id:'d4', cat:'Talk',   title:'Send a song that says “I miss you” without those words',
    duration:'5 min',  mood:'soft',   materials:['feelings, lightly worn'],
    steps:['No explaining','Just send','The other person guesses why'] },
  { id:'d5', cat:'Food',   title:'Cook the same meal, on call',
    duration:'45–60 min', mood:'low effort, high serotonin', materials:['both kitchens'],
    steps:['Pick a dish you both have for','Open the call, prop the phone','Compare results. Be kind about the burnt one.'] },
  { id:'d6', cat:'Talk',   title:'20 questions, but only honest answers',
    duration:'30 min', mood:'real',   materials:['a list, written on the fly'],
    steps:['Take turns','Skip allowed once each','No follow-up unless invited'] },
  { id:'d7', cat:'Future', title:'Plan our dream weekend (no budget rules)',
    duration:'20 min', mood:'hopeful',materials:['notes app'],
    steps:['Pick a city','Plan Friday night to Sunday brunch','Save it. We’re using it later.'] },
  { id:'d8', cat:'Memory', title:'Guess the blurred photo',
    duration:'10 min', mood:'warm',   materials:['this app'],
    steps:['Open Blurred Photo','One round each','Loser sends a memory back'] },
  { id:'d9', cat:'Create', title:'Build a fake apartment shopping list',
    duration:'25 min', mood:'domestic-coded', materials:['IKEA tab','dreams'],
    steps:['One link each, take turns','Veto allowed, but you must explain','Save the list. We’re definitely using it.'] },
  { id:'d10', cat:'Memory',title:'Tell the story of our first call from both sides',
    duration:'15 min', mood:'tender', materials:['memory, lightly edited'],
    steps:['You start','Then me','Argue gently about who said “ok bye” first'] },
];

const SAVED_DATES = ['d3', 'd5', 'd10']; // ids in DATE_IDEAS

// Open When Letters
const LETTER_CATEGORIES = [
  'Open when you miss me',
  'Open when you are sad',
  'Open when you need motivation',
  'Open when you want to laugh',
  'Open after an argument',
  'Open before sleeping',
  'Open before a hard day',
  'Open when you need to remember us',
];

const LETTERS = [
  { id:'l1', category:'Open when you miss me', author:'Dhruv',  recipient:'Anjali',
    written:'May 02, 2026', locked:false, tone:'coral',
    body:'I left a window open in my head for you. Whenever you read this, climb in. Look around. Make some chai. Pretend the distance is just a hallway, not a hemisphere.\n\nThe rooftop call — that one. Go back to it for a minute. I do, more often than I tell you.\n\nP.S. The hoodie still smells like the airport. I refuse to wash it.' },
  { id:'l2', category:'Open when you are sad', author:'Dhruv',  recipient:'Anjali',
    written:'Apr 14, 2026', locked:false, tone:'lavender',
    body:'You don’t have to be okay right now. Sit with it. Make a small thing — toast, tea, a list of three songs.\n\nI am here in the next room of the internet. Call when you can. Don’t call if you can’t. Either way I am still here.' },
  { id:'l3', category:'Open when you need motivation', author:'Anjali', recipient:'Dhruv',
    written:'Mar 21, 2026', locked:false, tone:'sage',
    body:'I have watched you do hard things from across an ocean. You don’t need a speech. You need water, ten minutes of silence, and to start the first small thing.\n\nThen the next small thing. That’s the whole trick. I love you. Go.' },
  { id:'l4', category:'Open when you want to laugh', author:'Dhruv',  recipient:'Anjali',
    written:'Feb 09, 2026', locked:true,  tone:'butter',
    body:'(sealed)' },
  { id:'l5', category:'Open after an argument', author:'Anjali', recipient:'Dhruv',
    written:'Jan 18, 2026', locked:true,  tone:'coral',
    body:'(sealed)' },
  { id:'l6', category:'Open before sleeping', author:'Anjali', recipient:'Dhruv',
    written:'Dec 30, 2025', locked:false, tone:'lavender',
    body:'Put the phone down. Yes, this one. After you finish reading.\n\nWhatever is loud in your head right now — we can deal with it tomorrow, together. I’ll be on the other side of morning. Sleep well, you.' },
  { id:'l7', category:'Open before a hard day', author:'Dhruv',  recipient:'Anjali',
    written:'Nov 11, 2025', locked:true,  tone:'sage',
    body:'(sealed)' },
  { id:'l8', category:'Open when you need to remember us', author:'Dhruv', recipient:'Anjali',
    written:'Oct 04, 2025', locked:false, tone:'coral',
    body:'Evidence, in case it ever feels far away:\n\n— The 4am airport.\n— The rooftop call.\n— The monsoon walk.\n— Burnt pancakes.\n— That one auto ride.\n\nWe keep making more. That’s the whole point.' },
];

// Memories timeline
const MEMORY_TAGS = ['Calls', 'Visits', 'Firsts', 'Funny', 'Hard Moments', 'Future', 'Music'];

// Each memory may carry a `spotify` field — either { trackId } or { trackUrl } you set
// later via the UI. Stored to localStorage so it persists; defaults are null below.
const MEMORIES = [
  { id:'m1', date:'Nov 12, 2024', title:'The 4am airport goodbye',
    location:'BLR → SFO', tags:['Visits','Hard Moments'],
    note:'You wore the grey hoodie. I kept the boarding pass.',
    song:'“Baarishein” · Anuv Jain', spotify: null,
    bg:'linear-gradient(135deg, #2A2438 0%, #5C4B7A 45%, #C99A8A 100%)' },
  { id:'m2', date:'Feb 18, 2025', title:'Burnt pancakes morning',
    location:'Your kitchen', tags:['Funny','Firsts'],
    note:'“It’s caramelised,” you said. With a straight face.',
    song:null, spotify: null,
    bg:'linear-gradient(135deg, #EADFC8 0%, #D9A66B 45%, #8C5A3A 100%)' },
  { id:'m3', date:'Apr 03, 2025', title:'A hard conversation we got through',
    location:'Two cities, one call', tags:['Hard Moments','Calls'],
    note:'We didn’t solve it. We agreed to keep talking. That counts.',
    song:null, spotify: null,
    bg:'linear-gradient(135deg, #8D8395 0%, #B8AEC2 50%, #D9CFD9 100%)' },
  { id:'m4', date:'Jul 09, 2025', title:'The monsoon walk',
    location:'Bengaluru', tags:['Visits','Music','Funny'],
    note:'My shoes never recovered. Worth it.',
    song:'“monsoon evening” playlist', spotify: null,
    bg:'linear-gradient(135deg, #6F8F8B 0%, #9CB6B1 50%, #2F3E45 100%)' },
  { id:'m5', date:'Aug 02, 2025', title:'Rooftop after the call dropped',
    location:'San Francisco, CA', tags:['Calls','Funny'],
    note:'You called back from the elevator. We just laughed for a minute.',
    song:null, spotify: null,
    bg:'linear-gradient(135deg, #F4A66B 0%, #E08F73 40%, #6B4A3E 100%)' },
  { id:'m6', date:'Oct 14, 2025', title:'A playlist that felt like us',
    location:'shared folder', tags:['Music','Firsts'],
    note:'Three languages, one mood. We sent it back and forth for a week.',
    song:'“ours · v1”', spotify: null,
    bg:'linear-gradient(135deg, #E5DEF0 0%, #B5A2D6 55%, #5C4B7A 100%)' },
  { id:'m7', date:'May 21, 2026', title:'The rooftop call',
    location:'two skies', tags:['Calls','Music'],
    note:'You held the phone up to the sky so I could see it too.',
    song:'“what was I made for?” · Billie Eilish', spotify: null,
    bg:'linear-gradient(135deg, #E5DEF0 0%, #C8B8DD 60%, #7D6FA0 100%)' },
  { id:'m8', date:'Someday', title:'Our first morning in the same kitchen',
    location:'TBD', tags:['Future','Firsts'],
    note:'Placeholder — we’ll come back and fill this in.',
    song:null, spotify: null,
    bg:'linear-gradient(135deg, #DCE7DD 0%, #BDD0BF 50%, #62836A 100%)' },
];

// Bucket list
const BUCKET_SECTIONS = ['Places to go', 'Food to try', 'Little rituals', 'Future home', 'Songs to share', 'Silly goals'];

const BUCKET_ITEMS = [
  { id:'b1',  section:'Little rituals', title:'Watch a sunrise together (any time zone counts)', addedBy:'Anjali', status:'Dreaming', note:'One of us is always up at the wrong hour anyway.' },
  { id:'b2',  section:'Future home',    title:'Cook pasta in our future kitchen',                addedBy:'Dhruv',  status:'Planned',  note:'You insist on a real knife. I agree.' },
  { id:'b3',  section:'Songs to share', title:'Make a shared Billie / Anuv playlist',            addedBy:'Anjali', status:'Done',     note:'14 songs. Three languages. One mood.' },
  { id:'b4',  section:'Future home',    title:'Decorate a tiny balcony',                         addedBy:'Anjali', status:'Dreaming', note:'String lights, one chair too many.' },
  { id:'b5',  section:'Food to try',    title:'Each other’s favorite street food',          addedBy:'Dhruv',  status:'Planned',  note:'Dosa cart for you. Halal cart for me.' },
  { id:'b6',  section:'Silly goals',    title:'Take a photo booth strip',                        addedBy:'Anjali', status:'Dreaming', note:'Four panels. Mandatory bad face on #3.' },
  { id:'b7',  section:'Places to go',   title:'A monsoon weekend in Goa',                        addedBy:'Dhruv',  status:'Planned',  note:'Off-season. On purpose.' },
  { id:'b8',  section:'Places to go',   title:'A long quiet train, anywhere',                    addedBy:'Anjali', status:'Dreaming', note:'No itinerary. Just window seats.' },
  { id:'b9',  section:'Little rituals', title:'A Sunday call we never skip',                     addedBy:'Both',   status:'Done',     note:'15 weeks running. Don’t jinx it.' },
  { id:'b10', section:'Silly goals',    title:'Win one argument by sending a song',              addedBy:'Dhruv',  status:'Dreaming', note:'It will be Baarishein. We both know.' },
];

const BUCKET_STATUSES = ['Dreaming', 'Planned', 'Done'];

Object.assign(window, {
  COUPLE, QUIZ_QUESTIONS, QUIZ_CATEGORIES,
  DRAW_TWISTS, DRAW_RATINGS,
  PHOTO_CHALLENGES, ACTIVITY, LATEST_MEMORY, TONIGHT_DATE, SOUNDTRACK,
  MOODS,
  DATE_CATEGORIES, DATE_IDEAS, SAVED_DATES,
  LETTER_CATEGORIES, LETTERS,
  MEMORY_TAGS, MEMORIES,
  BUCKET_SECTIONS, BUCKET_ITEMS, BUCKET_STATUSES,
});
