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
          <Nav />
          <SearchBar />
          <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
          <footer className="max-w-2xl mx-auto px-4 py-10 text-center text-xs text-gray-400">
            Mostra e Vende · protótipo
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
