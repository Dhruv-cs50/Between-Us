/* Supabase client, auth helpers, and all DB/Storage query functions.
   Exported to window so every page file can call them without imports. */

const { createClient } = supabase;
const _sb = createClient(
  'https://bgjwqqgpfljjgvsydpao.supabase.co',
  'sb_publishable_q62z0muB7Ztmn51lVEyXNQ_0OfD5FP0'
);

/* ── Auth ── */
const sbSignIn = (email, password) =>
  _sb.auth.signInWithPassword({ email, password });

const sbSignOut = () => _sb.auth.signOut();

const sbGetSession = () => _sb.auth.getSession();

const sbOnAuthChange = (cb) => _sb.auth.onAuthStateChange(cb);

/* ── Profile / Couple ── */
const sbGetProfile = async (userId) => {
  const { data, error } = await _sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

const sbGetCouple = async (coupleId) => {
  const { data, error } = await _sb
    .from('couples')
    .select('*')
    .eq('id', coupleId)
    .single();
  if (error) throw error;
  return data;
};

const sbLinkPartner = async (inviteCode) => {
  const { data: { user } } = await _sb.auth.getUser();
  const { data: target, error: findErr } = await _sb
    .from('profiles')
    .select('couple_id')
    .eq('invite_code', inviteCode)
    .single();
  if (findErr || !target) throw new Error('Invite code not found');
  const { error } = await _sb
    .from('profiles')
    .update({ couple_id: target.couple_id })
    .eq('id', user.id);
  if (error) throw error;
};

const sbUpdateNextVisit = async (coupleId, date) => {
  const { error } = await _sb
    .from('couples')
    .update({ next_visit: date })
    .eq('id', coupleId);
  if (error) throw error;
};

/* ── Memories ── */
const sbFetchMemories = async (coupleId) => {
  const { data, error } = await _sb
    .from('memories')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const sbAddMemory = async (coupleId, fields) => {
  const { data, error } = await _sb
    .from('memories')
    .insert({ couple_id: coupleId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const sbUpdateMemory = async (id, fields) => {
  const { error } = await _sb.from('memories').update(fields).eq('id', id);
  if (error) throw error;
};

const sbDeleteMemory = async (id) => {
  const { error } = await _sb.from('memories').delete().eq('id', id);
  if (error) throw error;
};

/* ── Letters ── */
const sbFetchLetters = async (coupleId) => {
  const { data, error } = await _sb
    .from('letters')
    .select('*')
    .eq('couple_id', coupleId)
    .order('written', { ascending: false });
  if (error) throw error;
  return data;
};

const sbAddLetter = async (coupleId, fields) => {
  const { data, error } = await _sb
    .from('letters')
    .insert({ couple_id: coupleId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const sbUpdateLetter = async (id, fields) => {
  const { error } = await _sb.from('letters').update(fields).eq('id', id);
  if (error) throw error;
};

const sbDeleteLetter = async (id) => {
  const { error } = await _sb.from('letters').delete().eq('id', id);
  if (error) throw error;
};

/* ── Bucket list ── */
const sbFetchBucketItems = async (coupleId) => {
  const { data, error } = await _sb
    .from('bucket_items')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

const sbAddBucketItem = async (coupleId, fields) => {
  const { data, error } = await _sb
    .from('bucket_items')
    .insert({ couple_id: coupleId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const sbUpdateBucketStatus = async (id, status) => {
  const { error } = await _sb.from('bucket_items').update({ status }).eq('id', id);
  if (error) throw error;
};

const sbUpdateBucketItem = async (id, fields) => {
  const { error } = await _sb.from('bucket_items').update(fields).eq('id', id);
  if (error) throw error;
};

const sbDeleteBucketItem = async (id) => {
  const { error } = await _sb.from('bucket_items').delete().eq('id', id);
  if (error) throw error;
};

/* ── Moods ── */
const sbFetchLatestMoods = async (coupleId) => {
  const { data, error } = await _sb
    .from('mood_checkins')
    .select('*')
    .eq('couple_id', coupleId)
    .order('checked_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  // Return latest mood per person: { dhruv: { mood, checked_at }, anjali: { mood, checked_at } }
  const result = {};
  (data || []).forEach(row => {
    if (!result[row.who]) result[row.who] = { mood: row.mood, checked_at: row.checked_at };
  });
  return result;
};

const sbUpsertMood = async (coupleId, who, mood) => {
  const { error } = await _sb.from('mood_checkins').insert({
    couple_id: coupleId, who, mood, checked_at: new Date().toISOString()
  });
  if (error) throw error;
};

/* ── Activity ── */
const sbFetchActivity = async (coupleId) => {
  const { data, error } = await _sb
    .from('activity')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
};

const sbLogActivity = async (coupleId, type, who, payload) => {
  const { error } = await _sb.from('activity').insert({
    couple_id: coupleId, type, who, payload,
    created_at: new Date().toISOString()
  });
  if (error) throw error;
};

/* ── Saved dates ── */
const sbFetchSavedDates = async (coupleId) => {
  const { data, error } = await _sb
    .from('saved_dates')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const sbSaveDate = async (coupleId, dateIdeaId) => {
  const { error } = await _sb
    .from('saved_dates')
    .insert({ couple_id: coupleId, date_idea_id: dateIdeaId });
  if (error) throw error;
};

/* ── Quiz attempts ── */
const sbRecordQuizAttempt = async (coupleId, who, questionId, answer, correct) => {
  const { error } = await _sb.from('quiz_attempts').insert({
    couple_id: coupleId, who, question_id: String(questionId), answer, correct
  });
  if (error) throw error;
};

/* ── Drawings ── */
const sbSaveDrawing = async (coupleId, canvasData, twist, rating) => {
  const { error } = await _sb.from('drawings').insert({
    couple_id: coupleId, canvas_data: canvasData, twist, rating
  });
  if (error) throw error;
};

/* ── Presence (real-time online status) ──
   Realtime Presence channel per couple. Each client tracks itself under a
   stable key (its auth user id) so multiple tabs of the same person collapse
   to one identity. `onChange` receives the array of present user ids. No DB
   tables involved — works on the default Realtime config. */
const sbJoinPresence = (coupleId, userId, meta, onChange) => {
  const channel = _sb.channel('presence:' + coupleId, {
    config: { presence: { key: userId } },
  });
  const emit = () => {
    const state = channel.presenceState();
    onChange(Object.keys(state)); // distinct present user ids
  };
  channel
    .on('presence', { event: 'sync' }, emit)
    .on('presence', { event: 'join' }, emit)
    .on('presence', { event: 'leave' }, emit)
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ ...(meta || {}), online_at: new Date().toISOString() });
      }
    });
  return channel;
};

const sbLeavePresence = (channel) => {
  if (channel) _sb.removeChannel(channel);
};

/* ── Storage ── */
const sbUploadPhoto = async (coupleId, memoryId, file) => {
  const ext = file.name.split('.').pop();
  const path = `${coupleId}/${memoryId}.${ext}`;
  const { error } = await _sb.storage.from('photos').upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
};

const sbGetPhotoUrl = async (imgPath) => {
  if (!imgPath) return null;
  const { data, error } = await _sb.storage
    .from('photos')
    .createSignedUrl(imgPath, 3600);
  if (error) return null;
  return data.signedUrl;
};

Object.assign(window, {
  _sb,
  sbSignIn, sbSignOut, sbGetSession, sbOnAuthChange,
  sbGetProfile, sbGetCouple, sbLinkPartner, sbUpdateNextVisit,
  sbFetchMemories, sbAddMemory, sbUpdateMemory, sbDeleteMemory,
  sbFetchLetters, sbAddLetter, sbUpdateLetter, sbDeleteLetter,
  sbFetchBucketItems, sbAddBucketItem, sbUpdateBucketStatus, sbUpdateBucketItem, sbDeleteBucketItem,
  sbFetchLatestMoods, sbUpsertMood,
  sbFetchActivity, sbLogActivity,
  sbFetchSavedDates, sbSaveDate,
  sbRecordQuizAttempt,
  sbSaveDrawing,
  sbJoinPresence, sbLeavePresence,
  sbUploadPhoto, sbGetPhotoUrl,
});
