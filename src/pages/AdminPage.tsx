import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  Building2,
  CheckCircle,
  FileUp,
  LoaderCircle,
  Pencil,
  Plane,
  Search,
  Settings,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/service/api';
import type { User, UserRole } from '@/utils/types';
import { ShapefileUploadCard } from '@/components/geoserver/ShapefileUploadCard';

type Tab = 'users' | 'aerodromes' | 'aeronefs' | 'layers' | 'settings';
type EditableUser = Pick<User, 'id' | 'nom' | 'email' | 'role' | 'isActive'>;

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  editeur: 'Éditeur',
  utilisateur: 'Utilisateur',
};

const ongletsNavigation: { tab: Tab; Icon: ComponentType<{ className?: string }>; label: string }[] = [
  { tab: 'users', Icon: Users, label: 'Utilisateurs & droits' },
  { tab: 'aerodromes', Icon: Building2, label: 'Aérodromes' },
  { tab: 'aeronefs', Icon: Plane, label: 'Aéronefs' },
  { tab: 'settings', Icon: Settings, label: 'Système & sécurité' },
  { tab: 'layers', Icon: FileUp, label: 'Couches SIG / Shapefile' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditableUser | null>(null);

  const chargerUtilisateurs = async () => {
    setLoading(true);
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void chargerUtilisateurs();
  }, []);

  const utilisateursFiltres = useMemo(() => {
    const terme = search.trim().toLowerCase();
    if (!terme) return users;
    return users.filter((u) => {
      const nomMatch = (u.nom || '').toLowerCase().includes(terme);
      const emailMatch = u.email.toLowerCase().includes(terme);
      return nomMatch || emailMatch;
    });
  }, [users, search]);

  const modifierUtilisateur = async (id: string, data: Partial<EditableUser>, messageSucces: string) => {
    setSaving(true);
    try {
      const maj = await api.users.update(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? maj : u)));
      toast.success(messageSucces);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'La modification a échoué.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const enregistrerEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { id, ...champs } = editing;
    const succes = await modifierUtilisateur(id, champs, 'Utilisateur modifié avec succès.');
    if (succes) setEditing(null);
  };

  const supprimerUtilisateur = async (utilisateur: User) => {
    const confirme = window.confirm(`Supprimer définitivement le compte de ${utilisateur.email} ?`);
    if (!confirme) return;

    setSaving(true);
    try {
      await api.users.delete(utilisateur.id);
      setUsers((prev) => prev.filter((u) => u.id !== utilisateur.id));
      toast.success('Utilisateur supprimé.');
    } catch (err: any) {
      toast.error(err.message || 'La suppression a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Espace Administration" subtitle="Gérez les comptes, droits d’accès et paramètres du portail">
      <div className="space-y-6">
        {/* Navigation des onglets */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-1 dark:border-slate-800">
          {ongletsNavigation.map(({ tab, Icon, label }) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 gap-2 rounded-none border-b-2 px-4 ${
                activeTab === tab
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </Button>
          ))}
        </div>

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="pl-9"
                />
              </div>
              <span className="text-xs text-slate-500">{utilisateursFiltres.length} compte(s)</span>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 dark:bg-slate-800/60">
                    <tr>
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Rôle</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Inscription</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-500">
                          <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />
                          Chargement des utilisateurs…
                        </td>
                      </tr>
                    ) : utilisateursFiltres.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-500">
                          Aucun utilisateur trouvé.
                        </td>
                      </tr>
                    ) : (
                      utilisateursFiltres.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white">{user.nom || 'Sans nom'}</div>
                            <div className="text-slate-500">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                user.role === 'admin'
                                  ? 'destructive'
                                  : user.role === 'editeur'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {roleLabels[user.role]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <button
                              disabled={saving}
                              onClick={() =>
                                modifierUtilisateur(
                                  user.id,
                                  { isActive: !user.isActive },
                                  user.isActive ? 'Compte suspendu.' : 'Compte réactivé.'
                                )
                              }
                              className="font-medium disabled:opacity-50"
                            >
                              {user.isActive ? (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <CheckCircle className="h-4 w-4" /> Actif
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-500">
                                  <XCircle className="h-4 w-4" /> Suspendu
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Intl.DateTimeFormat('fr-FR').format(new Date(user.createdAt))}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setEditing({
                                    id: user.id,
                                    nom: user.nom ?? '',
                                    email: user.email,
                                    role: user.role,
                                    isActive: user.isActive,
                                  })
                                }
                              >
                                <Pencil className="h-3.5 w-3.5" /> Modifier
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={saving}
                                onClick={() => supprimerUtilisateur(user)}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Onglet Couches SIG */}
        {activeTab === 'layers' && <ShapefileUploadCard />}

        {/* Autres onglets */}
        {activeTab !== 'users' && activeTab !== 'layers' && (
          <Card className="p-6">
            <h3 className="font-semibold">
              {activeTab === 'aerodromes'
                ? 'Gestion des aérodromes'
                : activeTab === 'aeronefs'
                ? 'Registre des aéronefs'
                : 'Paramètres techniques'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Cette section est prête à être reliée aux données correspondantes.
            </p>
          </Card>
        )}
      </div>

      {/* Boîte de dialogue pour modifier un utilisateur */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un utilisateur</DialogTitle>
            <DialogDescription>
              Les changements sont enregistrés immédiatement dans la base de données.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <form onSubmit={enregistrerEdition} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom complet</label>
                <Input
                  value={editing.nom}
                  onChange={(e) => setEditing({ ...editing, nom: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Adresse e-mail</label>
                <Input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Rôle</label>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="utilisateur">Utilisateur</option>
                  <option value="editeur">Éditeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <LoaderCircle className="h-4 w-4 animate-spin mr-1" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
