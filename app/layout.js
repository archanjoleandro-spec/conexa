import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Nav from '@/components/Nav';
import SearchBar from '@/components/SearchBar';

export const metadata = {
  title: 'Mostra e Vende — fica por dentro de tudo',
  description: 'Notícias, famosos, curiosidades e marketplace. Tudo que tá bombando, num só lugar.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <div className="min-h-screen md:flex bg-gray-50 text-gray-900">
            <Nav />
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="hidden md:block sticky top-0 z-20 bg-gray-50/90 backdrop-blur border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-3"><SearchBar /></div>
              </div>
              <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-5">{children}</main>
              <footer className="text-center text-xs text-gray-400 py-6">Mostra e Vende · protótipo</footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
