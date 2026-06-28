'use client';
import { useState } from 'react';

const CATS = ['Tudo', 'Notícias', 'Famosos', 'Curiosidades', 'Esportes', 'Mundo'];

const POSTS = [
  { cat:'Curiosidades', tag:'🤯 Bombando', title:'O coração humano bate cerca de 100 mil vezes por dia', sub:'E em média 3 bilhões de vezes ao longo da vida. O corpo é uma máquina impressionante.', seed:'heart', hot:true },
  { cat:'Esportes', tag:'⚽ Copa 2026', title:'Copa do Mundo 2026 terá 48 seleções; final em 19 de julho', sub:'A maior Copa da história será sediada por EUA, México e Canadá.', seed:'soccer', hot:true },
  { cat:'Curiosidades', tag:'🐙 Inacreditável', title:'O polvo tem três corações e sangue azul', sub:'A cor vem da hemocianina, que transporta oxigênio no sangue do animal.', seed:'octopus' },
  { cat:'Famosos', tag:'✨ Em alta', title:'Os criadores de conteúdo que mais cresceram no Brasil', sub:'Canais de curiosidades como o "Você Sabia?" passam de 47 milhões de inscritos.', seed:'celeb', hot:true },
  { cat:'Curiosidades', tag:'🧠 Você sabia?', title:'Seu cérebro gera energia suficiente para acender uma lâmpada', sub:'Cerca de 12 a 25 watts — o bastante para uma pequena luz de LED.', seed:'brain' },
  { cat:'Mundo', tag:'🌍 Pelo mundo', title:'Existem mais estrelas no universo do que grãos de areia na Terra', sub:'Estimativas apontam mais de 100 bilhões de galáxias observáveis.', seed:'space' },
  { cat:'Notícias', tag:'📰 Destaque', title:'Tecnologia: o que promete mudar o seu dia a dia neste ano', sub:'Inteligência artificial e apps sociais lideram as tendências de consumo.', seed:'tech' },
  { cat:'Curiosidades', tag:'🍯 Curioso', title:'O mel nunca estraga: potes de 3 mil anos foram achados comestíveis', sub:'Arqueólogos encontraram mel preservado em tumbas no Egito antigo.', seed:'honey' },
  { cat:'Esportes', tag:'🏆 Recorde', title:'A taça da Copa é feita de ouro 18 quilates e pesa mais de 6 kg', sub:'O troféu atual existe desde 1974 e guarda curiosidades surpreendentes.', seed:'trophy' },
  { cat:'Mundo', tag:'🌋 Natureza', title:'Um raio é cinco vezes mais quente que a superfície do Sol', sub:'Pode atingir cerca de 30.000 °C em uma fração de segundo.', seed:'lightning' },
  { cat:'Famosos', tag:'🎬 Cultura pop', title:'Os bastidores que viram febre nas redes toda semana', sub:'Conteúdos de entretenimento dominam o tempo de tela dos brasileiros.', seed:'movie' },
  { cat:'Notícias', tag:'💸 Bolso', title:'Pequenos hábitos que ajudam a economizar sem perceber', sub:'Da conta de luz ao mercado: dicas práticas que viralizam.', seed:'money' },
];

function img(seed){ return `https://picsum.photos/seed/${seed}/600/420`; }

export default function DescubraPage() {
  const [cat, setCat] = useState('Tudo');
  const list = cat === 'Tudo' ? POSTS : POSTS.filter(p => p.cat === cat);
  const hot = POSTS.filter(p => p.hot);

  return (
    <div className="-mt-2">
      {/* HERO */}
      <div className="rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-fuchsia-600 via-brand to-indigo-600 text-white p-6 sm:p-8 shadow-lg">
        <span className="inline-block text-xs font-bold bg-white/20 rounded-full px-3 py-1 mb-3">🔥 EM ALTA AGORA</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Tudo que tá bombando, num só lugar</h1>
        <p className="mt-2 text-white/90 max-w-md">Notícias, famosos, curiosidades e o que todo mundo tá comentando. Não fica de fora — <b>Vai Lá!</b></p>
      </div>

      {/* TRENDING STRIP */}
      <div className="mb-5">
        <h2 className="font-bold mb-2 flex items-center gap-2">🔥 Destaques do dia</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {hot.map((p,i) => (
            <div key={i} className="min-w-[230px] max-w-[230px] card overflow-hidden">
              <div className="h-28 bg-gray-100"><img src={img(p.seed)} alt="" className="w-full h-full object-cover" /></div>
              <div className="p-3">
                <span className="text-[11px] font-bold text-fuchsia-600">{p.tag}</span>
                <p className="font-semibold text-sm line-clamp-2 mt-1">{p.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="flex gap-2 flex-wrap mb-4 sticky top-14 bg-gray-50 py-2 z-10">
        {CATS.map(c => (
          <button key={c} onClick={()=>setCat(c)}
            className={"px-4 py-1.5 rounded-full text-sm font-medium transition "+(cat===c?'bg-brand text-white shadow':'bg-white border border-gray-200 text-gray-600 hover:border-brand')}>
            {c}
          </button>
        ))}
      </div>

      {/* FEED GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map((p,i) => (
          <article key={i} className="card overflow-hidden hover:shadow-md transition cursor-pointer group">
            <div className="h-44 bg-gray-100 relative overflow-hidden">
              <img src={img(p.seed)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <span className="absolute top-2 left-2 text-[11px] font-bold bg-black/70 text-white rounded-full px-2 py-1">{p.tag}</span>
            </div>
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wide text-brand">{p.cat}</span>
              <h3 className="font-bold leading-snug mt-1">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.sub}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>❤️ {120 + i*37}</span><span>💬 {12 + i*4}</span><span>🔗 Compartilhar</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">Conteúdo de curiosidades factuais · em breve, notícias ao vivo</p>
    </div>
  );
}
