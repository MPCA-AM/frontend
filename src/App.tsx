import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';
import AppRoutes from '@/pages/AppRoutes';

// -----------------------------------------------------------------------------
// Application providers and route tree
// -----------------------------------------------------------------------------

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter><AppRoutes /></BrowserRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
