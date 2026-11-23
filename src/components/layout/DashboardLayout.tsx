import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Shield,
  Edit,
  User,
  LogOut,
  Menu,
  X,
  Plane,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user, logout, isAdmin, isEditeur } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Carte aéronautique', path: '/map', icon: Map },
    ...(isEditeur ? [{ label: 'Espace Éditeur', path: '/editeur', icon: Edit }] : []),
    ...(isAdmin ? [{ label: 'Administration', path: '/admin', icon: Shield }] : []),
    { label: 'Mon Profil', path: '/profil', icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans">
      {/* ── Mobile Sidebar Backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (Bleu Marine + Accent Vert Émeraude) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0f172a] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800/80 shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <Plane className="h-6 w-6 rotate-45" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Avia<span className="text-emerald-400">Mada</span>
              </span>
              <span className="block text-[10px] tracking-widest text-emerald-300/80 uppercase font-semibold">
                Portail Aviation MG
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Card Mini */}
        <div className="m-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-sm">
            {user?.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">{user?.nom || 'Utilisateur'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0">
                {user?.role || 'visiteur'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-2 overflow-y-auto">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Système
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout bottom */}
        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 rounded-xl text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* ── Main Content Container ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] px-4 sm:px-6 shrink-0 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-700 dark:text-slate-200"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none">
                {title || 'Portail Cartographique'}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-1 leading-none">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl text-slate-600 dark:text-slate-300"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
            </Button>
            <ModeToggle />
            <div className="hidden md:flex items-center pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#090d16]">
          {children}
        </main>
      </div>
    </div>
  );
}
