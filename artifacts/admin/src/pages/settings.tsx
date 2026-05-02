import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/queryClient";

interface SettingDef {
  key: string;
  label: string;
  description?: string;
  type: "text" | "textarea" | "boolean" | "number";
  defaultValue: any;
}

const DEFS: SettingDef[] = [
  {
    key: "videos_enabled",
    label: "Activer la section Vidéos",
    description: "Afficher l'onglet Vidéos dans l'application mobile",
    type: "boolean",
    defaultValue: true,
  },
  {
    key: "ai_enabled",
    label: "Activer Nour IA",
    description: "Permettre aux utilisateurs d'utiliser l'assistant IA islamique",
    type: "boolean",
    defaultValue: true,
  },
  {
    key: "agenda_enabled",
    label: "Activer l'agenda islamique",
    description: "Afficher les événements hijri dans l'app",
    type: "boolean",
    defaultValue: true,
  },
  {
    key: "mosques_enabled",
    label: "Activer Mosquées à proximité",
    description: "Afficher la recherche de mosquées via Google Places",
    type: "boolean",
    defaultValue: true,
  },
  {
    key: "halal_enabled",
    label: "Activer Commerces halal",
    description: "Afficher la recherche de commerces halal via Google Places",
    type: "boolean",
    defaultValue: true,
  },
  {
    key: "welcome_message_fr",
    label: "Message d'accueil (FR)",
    description: "Message affiché au lancement de l'app",
    type: "textarea",
    defaultValue: "Bismillah · Bienvenue dans Anssam",
  },
  {
    key: "ai_max_messages_per_day",
    label: "Messages IA max par jour",
    description: "Limite quotidienne par utilisateur pour Nour IA",
    type: "number",
    defaultValue: 50,
  },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, any>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<{ settings: Record<string, any> }>({
    queryKey: ["admin-settings"],
    queryFn: () => api("/api/admin/settings"),
  });

  useEffect(() => {
    const merged: Record<string, any> = {};
    for (const d of DEFS) {
      const stored = data?.settings?.[d.key];
      merged[d.key] = stored !== undefined ? stored : d.defaultValue;
    }
    setValues(merged);
    setDirty(new Set());
  }, [data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const updates = Array.from(dirty).map((key) =>
        api(`/api/admin/settings/${key}`, {
          method: "PUT",
          body: JSON.stringify({ value: values[key] }),
        })
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({ title: "Paramètres enregistrés" });
      setDirty(new Set());
    },
    onError: (err: Error) =>
      toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const update = (key: string, value: any) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty((d) => new Set(d).add(key));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Paramètres" subtitle="Configuration de l'application">
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Paramètres" subtitle="Configuration globale de l'app Anssam">
      <Card className="p-6 max-w-3xl border-slate-200 dark:border-slate-800">
        <div className="space-y-6">
          {DEFS.map((d) => (
            <div key={d.key} className="pb-6 border-b last:border-b-0 last:pb-0 border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <Label htmlFor={d.key} className="text-base font-medium text-slate-900 dark:text-white">
                    {d.label}
                  </Label>
                  {d.description && (
                    <p className="text-sm text-slate-500 mt-1">{d.description}</p>
                  )}
                </div>
                {d.type === "boolean" && (
                  <Switch
                    id={d.key}
                    data-testid={`switch-${d.key}`}
                    checked={!!values[d.key]}
                    onCheckedChange={(c) => update(d.key, c)}
                  />
                )}
              </div>
              {d.type === "text" && (
                <Input
                  id={d.key}
                  value={values[d.key] ?? ""}
                  onChange={(e) => update(d.key, e.target.value)}
                />
              )}
              {d.type === "textarea" && (
                <Textarea
                  id={d.key}
                  rows={2}
                  value={values[d.key] ?? ""}
                  onChange={(e) => update(d.key, e.target.value)}
                />
              )}
              {d.type === "number" && (
                <Input
                  id={d.key}
                  type="number"
                  className="max-w-xs"
                  value={values[d.key] ?? 0}
                  onChange={(e) => update(d.key, parseInt(e.target.value) || 0)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            onClick={() => saveMut.mutate()}
            disabled={dirty.size === 0 || saveMut.isPending}
            data-testid="button-save-settings"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saveMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer{dirty.size > 0 ? ` (${dirty.size})` : ""}
          </Button>
        </div>
      </Card>
    </AdminLayout>
  );
}
