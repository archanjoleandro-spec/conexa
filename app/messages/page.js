'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

function Messages() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const activeId = params.get('c');
  const [convs, setConvs] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [other, setOther] = useState(null);
  const endRef = useRef(null);

  async function loadConvs() {
    if (!user) return;
    const { data } = await supabase.from('conversations')
      .select('*').or(`user_a.eq.${user.id},user_b.eq.${user.id}`).order('created_at',{ascending:false});
    const list = data || [];
    const otherIds = list.map(c => c.user_a===user.id ? c.user_b : c.user_a);
    let profMap = {};
    if (otherIds.length) {
      const { data: profs } = await supabase.from('profiles').select('id,username,full_name').in('id', otherIds);
      (profs||[]).forEach(p => profMap[p.id]=p);
    }
    setConvs(list.map(c => ({ ...c, other: profMap[c.user_a===user.id?c.user_b:c.user_a] })));
  }

  async function loadThread(id) {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', id).order('created_at',{ascending:true});
    setMsgs(data || []);
    const c = convs.find(x=>x.id===id);
    if (c) setOther(c.other);
  }

  useEffect(() => { if (user) loadConvs(); }, [user]);
  useEffect(() => {
    if (!activeId) return;
    loadThread(activeId);
    const ch = supabase.channel('msg-'+activeId)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:`conversation_id=eq.${activeId}` },
        (payload) => setMsgs(m => [...m, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId, convs.length]);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    const body = text.trim(); setText('');
    await supabase.from('messages').insert({ conversation_id: activeId, sender_id: user.id, body });
  }

  if (loading) return <p className="text-gray-400 py-10 text-center">Carregando...</p>;
  if (!user) return <div className="card p-6 text-center">Entre para usar o chat. <a href="/login" className="text-brand underline">Login</a></div>;

  return (
    <div className="grid grid-cols-3 gap-3 h-[70vh]">
      <div className="col-span-1 card p-2 overflow-y-auto">
        <h2 className="font-bold px-2 py-1">Conversas</h2>
        {convs.map(c => (
          <button key={c.id} onClick={()=>router.push(`/messages?c=${c.id}`)}
            className={"w-full text-left px-2 py-2 rounded-lg "+(activeId===c.id?'bg-brand/10':'hover:bg-gray-50')}>
            <p className="font-medium text-sm">{c.other?.full_name || c.other?.username || '...'}</p>
            <p className="text-xs text-gray-400">@{c.other?.username}</p>
          </button>
        ))}
        {convs.length===0 && <p className="text-xs text-gray-400 px-2 py-4">Nenhuma conversa. Abra um perfil e clique em "Conversar".</p>}
      </div>
      <div className="col-span-2 card flex flex-col">
        {activeId ? (
          <>
            <div className="border-b p-3 font-semibold">{other?.full_name || other?.username || 'Conversa'}</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {msgs.map(m => (
                <div key={m.id} className={"max-w-[75%] px-3 py-2 rounded-2xl text-sm "+(m.sender_id===user.id?'bg-brand text-white ml-auto':'bg-gray-100')}>
                  {m.body}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="p-3 border-t flex gap-2">
              <input className="input flex-1" placeholder="Mensagem..." value={text} onChange={e=>setText(e.target.value)} />
              <button className="btn">Enviar</button>
            </form>
          </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-400">Selecione uma conversa</div>}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return <Suspense fallback={<p className="text-center py-10 text-gray-400">Carregando...</p>}><Messages /></Suspense>;
}
