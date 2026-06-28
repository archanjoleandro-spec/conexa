import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'Vai Lá — fica por dentro de tudo',
  description: 'Notícias, famosos, curiosidades e marketplace. Tudo que tá bombando, num só lugar.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Nav />
          <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
          <footer className="max-w-2xl mx-auto px-4 py-10 text-center text-xs text-gray-400">
            Vai Lá · protótipo
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
