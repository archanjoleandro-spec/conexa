'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

const PRIM = [
  { href: '/descubra', label: 'Descubra', icon: '🔥' },
  { href: '/', label: 'Feed', icon: '📸' },
  { href: '/buscar', label: 'Buscar', icon: '🔎' },
  { href: '/market', label: 'Mercado', icon: '🛒' },
];
const CATS = [
  { cat: 'noticias', label: 'Notícias', icon: '📰' },
  { cat: 'esportes', label: 'Esportes', icon: '⚽' },
  { cat: 'famosos', label: 'Famosos', icon: '⭐' },
  { cat: 'curiosidades', label: 'Curiosidades', icon: '💡' },
  { cat: 'economia', label: 'Economia', icon: '📈' },
  { cat: 'receitas', label: 'Receitas', icon: '🍳' },
];

export default function Nav() {
  const { user } = useAuth();
  const path = usePathname();
  const sair = async () => { await supabase.auth.signOut(); window.location.href = '/'; };

  const Item = ({ href, icon, label, active }) => (
    <Link href={href} className={'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ' + (active ? 'bg-white/15 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white')}>
      <span className="text-base w-5 text-center">{icon}</span>{label}
    </Link>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:h-screen md:sticky md:top-0 bg-gray-900 text-white p-4 gap-1 overflow-y-auto">
        <Link href="/descubra" className="text-xl font-extrabold px-2 py-3 bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Mostra e Vende</Link>
        {PRIM.map((i) => <Item key={i.href} href={i.href} icon={i.icon} label={i.label} active={path === i.href} />)}
        <div className="text-[11px] uppercase tracking-wide text-gray-500 px-3 mt-4 mb-1">Editorias</div>
        {CATS.map((i) => <Item key={i.cat} href={'/descubra?cat=' + i.cat} icon={i.icon} label={i.label} active={false} />)}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-1">
          {user && <Item href="/messages" icon="💬" label="Chat" active={path === '/messages'} />}
          {user
            ? <button onClick={sair} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white text-left"><span className="text-base w-5 text-center">🚪</span>Sair</button>
            : <Item href="/login" icon="👤" label="Entrar" active={path === '/login'} />}
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-30 bg-gray-900 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/descubra" className="text-lg font-extrabold bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Mostra e Vende</Link>
          {user ? <button onClick={sair} className="text-xs text-gray-300">Sair</button> : <Link href="/login" className="text-xs text-gray-300">Entrar</Link>}
        </div>
        <nav className="flex gap-1 px-2 pb-2 overflow-x-auto text-sm">
          {PRIM.map((i) => <Link key={i.href} href={i.href} className={'px-3 py-1.5 rounded-full whitespace-nowrap ' + (path === i.href ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-300')}>{i.icon} {i.label}</Link>)}
        </nav>
      </header>
    </>
  );
}
