import { supabase } from '@/lib/supabase';

// deterministic ordering so (user_a,user_b) is unique regardless of who starts
export async function getOrCreateConversation(meId, otherId) {
  const [a, b] = [meId, otherId].sort();
  let { data: conv } = await supabase.from('conversations').select('*').eq('user_a',a).eq('user_b',b).maybeSingle();
  if (!conv) {
    const { data, error } = await supabase.from('conversations').insert({ user_a:a, user_b:b }).select('*').single();
    if (error) throw error;
    conv = data;
  }
  return conv;
}
