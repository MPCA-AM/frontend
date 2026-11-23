import { useState, useRef, type FormEvent, type DragEvent } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  LoaderCircle,
  Upload,
  X,
  FileCheck2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type ImportMode = 'direct' | 'zip';

interface ShapefileSlot {
  key: 'shp' | 'shx' | 'dbf' | 'prj';
  ext: string;
  label: string;
  desc: string;
  icon: typeof FileText;
  file: File | null;
  setFile: (file: File | null) => void;
}

export function ShapefileUploadCard() {
  const [mode, setMode] = useState<ImportMode>('direct');
  const [layerName, setLayerName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fichiers directs
  const [shpFile, setShpFile] = useState<File | null>(null);
  const [shxFile, setShxFile] = useState<File | null>(null);
  const [dbfFile, setDbfFile] = useState<File | null>(null);
  const [prjFile, setPrjFile] = useState<File | null>(null);

  // Archive ZIP
  const [zipFile, setZipFile] = useState<File | null>(null);

  // Références inputs cachés
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const shpInputRef = useRef<HTMLInputElement | null>(null);
  const shxInputRef = useRef<HTMLInputElement | null>(null);
  const dbfInputRef = useRef<HTMLInputElement | null>(null);
  const prjInputRef = useRef<HTMLInputElement | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const slots: ShapefileSlot[] = [
    {
      key: 'shp',
      ext: '.shp',
      label: 'Géométrie vectorielle',
      desc: 'Formes géométriques (points, lignes, polygones)',
      icon: Layers,
      file: shpFile,
      setFile: (f) => {
        setShpFile(f);
        if (f && !layerName) {
          const auto = f.name.replace(/\.shp$/i, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_');
          setLayerName(auto);
        }
      },
    },
    {
      key: 'shx',
      ext: '.shx',
      label: 'Index spatial',
      desc: 'Index de positionnement pour accès rapide',
      icon: FileText,
      file: shxFile,
      setFile: setShxFile,
    },
    {
      key: 'dbf',
      ext: '.dbf',
      label: 'Table attributaire',
      desc: 'Données tabulaires dBASE associées aux entités',
      icon: FileSpreadsheet,
      file: dbfFile,
      setFile: setDbfFile,
    },
    {
      key: 'prj',
      ext: '.prj',
      label: 'Projection & SCR',
      desc: 'Définition du système de coordonnées géographiques',
      icon: Globe,
      file: prjFile,
      setFile: setPrjFile,
    },
  ];

  // Distribution des fichiers multiples selon leurs extensions
  const dispatchIncomingFiles = (fileList: FileList | File[]) => {
    const list = Array.from(fileList);
    let newShp = shpFile;
    let newShx = shxFile;
    let newDbf = dbfFile;
    let newPrj = prjFile;
    let foundZip: File | null = null;

    for (const f of list) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (ext === 'shp') newShp = f;
      else if (ext === 'shx') newShx = f;
      else if (ext === 'dbf') newDbf = f;
      else if (ext === 'prj') newPrj = f;
      else if (ext === 'zip') foundZip = f;
    }

    if (foundZip && !newShp) {
      setMode('zip');
      setZipFile(foundZip);
      if (!layerName) {
        setLayerName(foundZip.name.replace(/\.zip$/i, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_'));
      }
      toast.info(`Archive ZIP "${foundZip.name}" détectée.`);
      return;
    }

    setShpFile(newShp);
    setShxFile(newShx);
    setDbfFile(newDbf);
    setPrjFile(newPrj);

    if (newShp && !layerName) {
      setLayerName(newShp.name.replace(/\.shp$/i, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_'));
    }
  };

  const getMissingExtensions = () => {
    const missing: string[] = [];
    if (!shpFile) missing.push('.shp');
    if (!shxFile) missing.push('.shx');
    if (!dbfFile) missing.push('.dbf');
    if (!prjFile) missing.push('.prj');
    return missing;
  };

  const getBaseNameMismatch = () => {
    if (!shpFile || !shxFile || !dbfFile || !prjFile) return null;
    const clean = (name: string, ext: string) =>
      name.replace(new RegExp(`\\.${ext}$`, 'i'), '').trim().toLowerCase();
    const base = clean(shpFile.name, 'shp');
    const mismatches: string[] = [];
    if (clean(shxFile.name, 'shx') !== base) mismatches.push(shxFile.name);
    if (clean(dbfFile.name, 'dbf') !== base) mismatches.push(dbfFile.name);
    if (clean(prjFile.name, 'prj') !== base) mismatches.push(prjFile.name);
    return mismatches.length > 0 ? { base, mismatches } : null;
  };

  const resetForm = () => {
    setShpFile(null);
    setShxFile(null);
    setDbfFile(null);
    setPrjFile(null);
    setZipFile(null);
    setLayerName('');
    setAttemptedSubmit(false);
    if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    if (shpInputRef.current) shpInputRef.current.value = '';
    if (shxInputRef.current) shxInputRef.current.value = '';
    if (dbfInputRef.current) dbfInputRef.current.value = '';
    if (prjInputRef.current) prjInputRef.current.value = '';
    if (zipInputRef.current) zipInputRef.current.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (mode === 'direct') {
        dispatchIncomingFiles(e.dataTransfer.files);
      } else {
        const file = e.dataTransfer.files[0];
        if (file.name.toLowerCase().endsWith('.zip')) {
          setZipFile(file);
          if (!layerName) {
            setLayerName(file.name.replace(/\.zip$/i, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_'));
          }
        } else {
          toast.error("Veuillez déposer une archive au format .zip.");
        }
      }
    }
  };

  const upload = async (event: FormEvent) => {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (mode === 'direct') {
      const missing = getMissingExtensions();
      if (missing.length > 0) {
        toast.error(
          `Import direct impossible : les 4 fichiers sont obligatoires. Fichier(s) manquant(s) : ${missing.join(', ')}`
        );
        return;
      }

      const mismatch = getBaseNameMismatch();
      if (mismatch) {
        toast.error(
          `Les 4 fichiers doivent avoir le même nom de base. Référence "${mismatch.base}", fichiers discordants : ${mismatch.mismatches.join(', ')}`
        );
        return;
      }

      setUploading(true);
      try {
        const files = [shpFile!, shxFile!, dbfFile!, prjFile!];
        const published = await api.geoserver.uploadShapefile(files, layerName);
        localStorage.setItem('geoserver-layers-updated', String(Date.now()));
        window.dispatchEvent(new Event('storage'));
        toast.success(`La couche ${published.name} est importée dans PostGIS et publiée dans GeoServer avec succès !`);
        resetForm();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'La publication GeoServer a échoué.';
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    } else {
      if (!zipFile) {
        toast.error('Sélectionnez une archive Shapefile .zip.');
        return;
      }
      if (!zipFile.name.toLowerCase().endsWith('.zip')) {
        toast.error('Le Shapefile doit être envoyé au format .zip.');
        return;
      }

      setUploading(true);
      try {
        const published = await api.geoserver.uploadShapefile(zipFile, layerName);
        localStorage.setItem('geoserver-layers-updated', String(Date.now()));
        window.dispatchEvent(new Event('storage'));
        toast.success(`La couche ${published.name} est importée dans PostGIS et publiée dans GeoServer avec succès !`);
        resetForm();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'La publication GeoServer a échoué.';
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    }
  };

  const missingExts = getMissingExtensions();
  const directFilesCount = [shpFile, shxFile, dbfFile, prjFile].filter(Boolean).length;
  const isDirectComplete = directFilesCount === 4;
  const mismatchInfo = getBaseNameMismatch();

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a] transition-all">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <FileArchive className="h-5 w-5" />
              </span>
              Importer et publier un Shapefile
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              Importez vos données géospatiales dans PostGIS avec publication automatique sur GeoServer (workspace Aviation).
            </CardDescription>
          </div>

          {/* Sélecteur de mode */}
          <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('direct');
                setAttemptedSubmit(false);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'direct'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-emerald-600 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              Fichiers directs (.shp, .shx, .dbf, .prj)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('zip');
                setAttemptedSubmit(false);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'zip'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-emerald-600 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileArchive className="h-3.5 w-3.5" />
              Archive ZIP (.zip)
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={upload} className="space-y-5">
          {/* Champ nom de la couche */}
          <div>
            <label htmlFor="layer-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nom de la couche GeoServer <span className="text-xs text-slate-500 font-normal">(optionnel, auto-déduit du fichier si non renseigné)</span>
            </label>
            <Input
              id="layer-name"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              placeholder="Ex. zones_interdites_madagascar"
              className="bg-slate-50/50 dark:bg-slate-900/50"
            />
          </div>

          {/* MODE FICHIERS DIRECTS */}
          {mode === 'direct' && (
            <div className="space-y-4">
              {/* Zone Glisser-Déposer multi-fichiers */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => multiFileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-300 hover:border-emerald-500/60 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/40 hover:bg-emerald-500/5'
                }`}
              >
                <input
                  ref={multiFileInputRef}
                  type="file"
                  multiple
                  accept=".shp,.shx,.dbf,.prj"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      dispatchIncomingFiles(e.target.files);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Déposez ici vos 4 fichiers Shapefile ou <span className="text-emerald-600 dark:text-emerald-400 underline">parcourez vos dossiers</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Les 4 fichiers <span className="font-semibold text-slate-700 dark:text-slate-300">.shp</span>,{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">.shx</span>,{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">.dbf</span> et{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">.prj</span> sont obligatoires.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statut dynamique et message d'erreur si fichiers manquants */}
              {attemptedSubmit && !isDirectComplete && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Importation impossible : tous les 4 fichiers sont obligatoires.</p>
                    <p>
                      Fichier(s) manquant(s) :{' '}
                      <span className="font-bold underline">{missingExts.join(', ')}</span>. Veuillez renseigner chacun des 4 composants ci-dessous.
                    </p>
                  </div>
                </div>
              )}

              {directFilesCount > 0 && !isDirectComplete && !attemptedSubmit && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    Fichiers sélectionnés : <strong>{directFilesCount}/4</strong>. Fichier(s) encore requis :{' '}
                    <strong>{missingExts.join(', ')}</strong>.
                  </span>
                </div>
              )}

              {isDirectComplete && !mismatchInfo && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Les 4 fichiers requis (.shp, .shx, .dbf, .prj) sont complets et prêts à être importés dans PostGIS.</span>
                </div>
              )}

              {mismatchInfo && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-semibold">Noms de fichiers non concordants :</span> Les 4 fichiers doivent partager le même nom de base (ex: <code>{mismatchInfo.base}.shp</code>, <code>{mismatchInfo.base}.shx</code>...). Fichiers différents : <strong>{mismatchInfo.mismatches.join(', ')}</strong>.
                  </div>
                </div>
              )}

              {/* Grille des 4 slots obligatoires */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {slots.map((slot) => {
                  const Icon = slot.icon;
                  const isMissing = !slot.file;
                  const isHighlightedError = attemptedSubmit && isMissing;

                  return (
                    <div
                      key={slot.key}
                      className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                        slot.file
                          ? 'border-emerald-500/40 bg-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                          : isHighlightedError
                          ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20 dark:border-rose-500'
                          : 'border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40'
                      }`}
                    >
                      {/* En-tête du slot */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                              slot.file
                                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                                : isHighlightedError
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {slot.ext}
                          </span>

                          {slot.file ? (
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/60 text-[10px] gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Présent
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] gap-1">
                              <AlertCircle className="h-3 w-3" /> Requis
                            </Badge>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            <Icon className="h-4 w-4 text-slate-500" />
                            {slot.label}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {slot.desc}
                          </p>
                        </div>
                      </div>

                      {/* Corps : fichier sélectionné ou bouton de sélection */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80">
                        {slot.file ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1 text-xs">
                              <span className="truncate font-mono font-medium text-slate-800 dark:text-slate-200" title={slot.file.name}>
                                {slot.file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => slot.setFile(null)}
                                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                title="Supprimer ce fichier"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400">{formatFileSize(slot.file.size)}</p>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept={slot.ext}
                              className="hidden"
                              id={`slot-file-${slot.key}`}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) slot.setFile(f);
                              }}
                            />
                            <label
                              htmlFor={`slot-file-${slot.key}`}
                              className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs font-medium transition-all ${
                                isHighlightedError
                                  ? 'border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Upload className="h-3 w-3" />
                              Choisir {slot.ext}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE ARCHIVE ZIP */}
          {mode === 'zip' && (
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => zipInputRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-300 hover:border-emerald-500/60 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/40 hover:bg-emerald-500/5'
                }`}
              >
                <input
                  ref={zipInputRef}
                  id="shapefile-zip-upload"
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setZipFile(f);
                      if (!layerName) {
                        setLayerName(f.name.replace(/\.zip$/i, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_'));
                      }
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FileArchive className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Déposez votre archive ZIP ici ou <span className="text-emerald-600 dark:text-emerald-400 underline">parcourez vos fichiers</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      L'archive doit obligatoirement contenir les fichiers Shapefile (.shp, .shx, .dbf, .prj).
                    </p>
                  </div>
                </div>
              </div>

              {zipFile && (
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                  <div className="flex items-center gap-2.5">
                    <FileArchive className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{zipFile.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(zipFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setZipFile(null);
                      if (zipInputRef.current) zipInputRef.current.value = '';
                    }}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bouton d'action et récapitulatif */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                {mode === 'direct'
                  ? 'Les 4 fichiers (.shp, .shx, .dbf, .prj) sont traités ensemble et insérés dans PostGIS.'
                  : 'L\'archive ZIP est décompressée côté serveur pour publication dans PostGIS & GeoServer.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                disabled={uploading}
                className="text-xs"
              >
                Réinitialiser
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="gap-2 bg-emerald-600 font-semibold text-white hover:bg-emerald-500 shadow-sm transition-all"
              >
                {uploading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Import PostGIS et publication…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importer et publier
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
