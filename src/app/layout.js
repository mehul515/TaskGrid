import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'TaskGrid',
  description: 'Modern project management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
