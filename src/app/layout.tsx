import { ConfigProvider } from '@/context/ConfigContext';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ConfigProvider>
          <ToastProvider />
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}