'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

export default function Nav() {
  const { user, profile } = useAuth();
  const router = useRouter();
  async function logout() { await supabase.auth.signOut(); router.push('/login'); }

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-brand">Conexa</Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="btn-ghost px-3 py-1.5">Feed</Link>
          <Link href="/explore" className="btn-ghost px-3 py-1.5">Explorar</Link>
          <Link href="/market" className="btn-ghost px-3 py-1.5">Mercado</Link>
          {user && <Link href="/messages" className="btn-ghost px-3 py-1.5">Chat</Link>}
          {user ? (
            <>
              <Link href={`/u/${profile?.username || ''}`} className="btn-ghost px-3 py-1.5">Perfil</Link>
              <button onClick={logout} className="btn-ghost px-3 py-1.5 text-red-600">Sair</button>
            </>
          ) : (
            <Link href="/login" className="btn px-3 py-1.5">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
