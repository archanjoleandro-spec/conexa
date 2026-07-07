'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

function tempo(d) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 60) return `há ${Math.max(1, Math.round(diff))} min`;
  if (diff < 1440) return `há ${Math.round(diff / 60)}h`;
  return `há ${Math.round(diff / 1440)}d`;
}
const nfmt = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n || 0);

export default function DescubraPage() {
  const { user } = useAuth();
  const [cats, setCats] = useState([]);
  const [arts, setArts] = useState([]);
  const [aba, setAba] = useState('todos');
  const [saved, setSaved] = useState(new Set());
  const [liked, setLiked] = useState(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: a }] = await Promise.all([
        supabase.from('news_categories').select('*').order('ordem'),
        supabase.from('news_articles').select('*').order('publicado_em', { ascending: false }).limit(60),
      ]);
      setCats(c || []); setArts(a || []); setReady(true);
      if (user) {
        const [{ data: s }, { data: l }] = await Promise.all([
          supabase.from('news_saves').select('article_id').eq('user_id', user.id),
          supabase.from('news_likes').select('article_id').eq('user_id', user.id),
        ]);
        setSaved(new Set((s || []).map(x => x.article_id)));
        setLiked(new Set((l || []).map(x => x.article_id)));
      }
    })();
  }, [user]);

  const corDe = (id) => cats.find(c => c.id === id)?.cor || '#7c3aed';
  const nomeDe = (id) => cats.find(c => c.id === id)?.nome || id;

  const lista = aba === 'todos' ? arts : arts.filter(a => a.categoria_id === aba);
  const destaques = arts.filter(a => a.destaque).slice(0, 3);
  const maisLidas = [...arts].sort((x, y) => (y.views || 0) - (x.views || 0)).slice(0, 8);

  async function toggleSave(id) {
    if (!user) return alert('Entre para salvar');
    const has = saved.has(id); const ns = new Set(saved);
    if (has) { ns.delete(id); await supabase.from('news_saves').delete().eq('article_id', id).eq('user_id', user.id); }
    else { ns.add(id); await supabase.from('news_saves').insert({ article_id: id, user_id: user.id }); }
    setSaved(ns);
  }
  async function toggleLike(id) {
    if (!user) return alert('Entre para curtir');
    const has = liked.has(id); const nl = new Set(liked);
    if (has) { nl.delete(id); await supabase.from('news_likes').delete().eq('article_id', id).eq('user_id', user.id); }
    else { nl.add(id); await supabase.from('news_likes').insert({ article_id: id, user_id: user.id }); }
    setLiked(nl);
  }

  const Tag = ({ id }) => (
    <span className="text-[11px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: corDe(id) }}>
      {nomeDe(id)}
    </span>
  );

  function Card({ a, big }) {
    return (
      <article className="card overflow-hidden group flex flex-col">
        <div className={"relative overflow-hidden bg-gray-100 " + (big ? 'h-56' : 'h-40')}>
          {a.imagem_url && <img src={a.imagem_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />}
          <span className="absolute top-2 left-2"><Tag id={a.categoria_id} /></span>
          {a.ao_vivo && <span className="absolute top-2 right-2 text-[11px] font-bold bg-red-600 text-white rounded-full px-2 py-0.5 animate-pulse">🔴 AO VIVO</span>}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className={"font-bold leading-snug " + (big ? 'text-lg' : 'text-base')}>{a.titulo}</h3>
          {a.resumo && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.resumo}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 pt-2 border-t border-gray-50">
            <span>{a.fonte_nome || 'Fonte'}</span><span>·</span><span>{tempo(a.publicado_em)}</span>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={() => toggleLike(a.id)} className={liked.has(a.id) ? 'text-red-600 font-semibold' : 'hover:text-gray-600'}>{liked.has(a.id) ? '♥' : '♡'} {nfmt(a.views)}</button>
              <button onClick={() => toggleSave(a.id)} className={saved.has(a.id) ? 'text-brand font-semibold' : 'hover:text-gray-600'}>{saved.has(a.id) ? '🔖' : '📄'}</button>
              {a.url_fonte && <a href={a.url_fonte} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold">ler mais →</a>}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="-mt-2">
      {/* HERO / DESTAQUES */}
      <div className="rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-fuchsia-600 via-brand to-indigo-600 text-white p-6 sm:p-7 shadow-lg">
        <span className="inline-block text-xs font-bold bg-white/20 rounded-full px-3 py-1 mb-2">🔥 EM ALTA AGORA</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Tudo que tá bombando, num só lugar</h1>
        <p className="mt-1 text-white/90 max-w-md">Notícias, esportes, novelas, famosos e curiosidades — atualizado o dia todo.</p>
      </div>

      {/* ABAS */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sticky top-[104px] bg-gray-50 z-10">
        {[{ id: 'todos', nome: 'Para você' }, ...cats].map(c => (
          <button key={c.id} onClick={() => setAba(c.id)}
            className={"px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition " + (aba === c.id ? 'bg-brand text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand')}>
            {c.nome}
          </button>
        ))}
      </div>

      {aba === 'todos' && destaques.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold mb-2 flex items-center gap-2">⭐ Destaques do dia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {destaques.map(a => <Card key={a.id} a={a} big />)}
          </div>
        </div>
      )}

      <h2 className="font-bold mb-2">{aba === 'todos' ? '📰 Para você' : nomeDe(aba)}</h2>
      {!ready && <p className="text-gray-400 py-8 text-center">Carregando...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lista.map(a => <Card key={a.id} a={a} />)}
      </div>
      {ready && lista.length === 0 && <p className="text-gray-500 text-center py-8">Nada por aqui ainda.</p>}

      {maisLidas.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold mb-2">🔥 Mais acessados</h2>
          <div className="grid grid-cols-1 gap-2">
            {maisLidas.map((a, i) => (
              <div key={a.id} className="card p-2 flex items-center gap-3">
                <span className="text-xl font-extrabold text-gray-300 w-6 text-center">{i + 1}</span>
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {a.imagem_url && <img src={a.imagem_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="min-w-0">
                  <Tag id={a.categoria_id} />
                  <p className="font-medium text-sm line-clamp-1 mt-0.5">{a.titulo}</p>
                  <p className="text-xs text-gray-400">{nfmt(a.views)} acessos · {tempo(a.publicado_em)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-8">Conteúdo de exemplo · em breve, notícias reais via API (GNews, Football-Data, etc.)</p>
    </div>
  );
}
