import { useState } from 'react';
import {
  User,
  Lock,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ProfilPage() {
  const { user } = useAuth();

  const [nom, setNom] = useState(user?.nom || '');
  const [email] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Informations personnelles mises à jour !');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    toast.success('Mot de passe modifié avec succès !');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <DashboardLayout
      title="Profil & Compte"
      subtitle="Gestion de vos informations et sécurité d'accès"
    >
      <div className="max-w-3xl space-y-6">
        {/* Profile Card Header */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-2xl font-bold shadow-md shadow-emerald-950">
              {user?.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.nom || 'Utilisateur'}
              </h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5">
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1 uppercase font-bold text-[10px]">
                  <Shield className="h-3 w-3" /> {user?.role || 'utilisateur'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Info Form */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" /> Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom complet
                  </label>
                  <Input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse e-mail
                  </label>
                  <Input
                    type="email"
                    disabled
                    value={email}
                    className="border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold gap-2"
                >
                  <Save className="h-3.5 w-3.5" /> Enregistrer les modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-500" /> Modifier le Mot de Passe
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Assurez-vous d'utiliser un mot de passe sécurisé d'au moins 8 caractères
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mot de passe actuel
                  </label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nouveau mot de passe
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmer nouveau
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-2 shadow-md shadow-emerald-950"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mettre à jour le mot de passe
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
