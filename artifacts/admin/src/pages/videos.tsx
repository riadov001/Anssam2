import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Eye, EyeOff, Youtube, Loader2 } from "lucide-react";

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/queryClient";

interface Video {
  id: number;
  title: string;
  titleFr?: string | null;
  titleAr?: string | null;
  description?: string | null;
  youtubeUrl?: string | null;
  embedUrl?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  ageGroup: string;
  language: string;
  isPublished: boolean;
  sortOrder: number;
}

const CATEGORIES = ["general", "quran", "prayer", "stories", "nasheeds"];
const AGE_GROUPS = ["all", "children", "youth", "adult"];
const LANGUAGES = ["fr", "ar", "en"];

const blankForm: Partial<Video> = {
  title: "", titleFr: "", titleAr: "", description: "", youtubeUrl: "",
  thumbnailUrl: "", category: "general", ageGroup: "all", language: "fr",
  isPublished: true, sortOrder: 0,
};

export default function VideosPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState<Partial<Video>>(blankForm);

  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ["admin-videos"],
    queryFn: () => api("/api/admin/videos"),
  });

  const saveMut = useMutation({
    mutationFn: (payload: Partial<Video>) => {
      if (editing) {
        return api(`/api/admin/videos/${editing.id}`, {
          method: "PUT", body: JSON.stringify(payload),
        });
      }
      return api("/api/admin/videos", {
        method: "POST", body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setOpen(false);
      setEditing(null);
      setForm(blankForm);
      toast({ title: editing ? "Vidéo mise à jour" : "Vidéo ajoutée" });
    },
    onError: (err: Error) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api(`/api/admin/videos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Vidéo supprimée" });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setOpen(true);
  };
  const openEdit = (v: Video) => {
    setEditing(v);
    setForm({ ...v });
    setOpen(true);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveMut.mutate(form);
  };

  return (
    <AdminLayout title="Vidéos" subtitle="Gérer les vidéos affichées dans l'app mobile">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {data?.videos?.length ?? 0} vidéo{(data?.videos?.length ?? 0) > 1 ? "s" : ""}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} data-testid="button-new-video" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle vidéo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier la vidéo" : "Nouvelle vidéo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label>Titre *</Label>
                <Input
                  data-testid="input-title"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Titre (FR)</Label>
                  <Input
                    value={form.titleFr || ""}
                    onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Titre (AR)</Label>
                  <Input
                    dir="rtl"
                    value={form.titleAr || ""}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>URL YouTube *</Label>
                <Input
                  data-testid="input-youtube"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={form.youtubeUrl || ""}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">L'URL embed sera générée automatiquement.</p>
              </div>
              <div>
                <Label>Miniature (optionnel)</Label>
                <Input
                  type="url"
                  placeholder="https://…/image.jpg"
                  value={form.thumbnailUrl || ""}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Public cible</Label>
                  <Select value={form.ageGroup} onValueChange={(v) => setForm({ ...form, ageGroup: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AGE_GROUPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Langue</Label>
                  <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((c) => <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={form.sortOrder ?? 0}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between border rounded-md px-3 mt-6">
                  <Label htmlFor="published" className="cursor-pointer">Publié</Label>
                  <Switch
                    id="published"
                    checked={form.isPublished ?? false}
                    onCheckedChange={(c) => setForm({ ...form, isPublished: c })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMut.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : data?.videos?.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Youtube className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Aucune vidéo</p>
          <p className="text-sm text-slate-500 mt-1">Cliquez sur « Nouvelle vidéo » pour commencer.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data?.videos?.map((v) => (
            <Card key={v.id} data-testid={`video-${v.id}`} className="p-4 border-slate-200 dark:border-slate-800">
              <div className="flex gap-4 items-start">
                <div className="w-32 h-20 rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Youtube className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {v.titleFr || v.title}
                      </p>
                      {v.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{v.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(v)} data-testid={`edit-${v.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Supprimer "${v.titleFr || v.title}" ?`)) deleteMut.mutate(v.id);
                        }}
                        data-testid={`delete-${v.id}`}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary">{v.category}</Badge>
                    <Badge variant="outline">{v.ageGroup}</Badge>
                    <Badge variant="outline">{v.language.toUpperCase()}</Badge>
                    {v.isPublished ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">
                        <Eye className="w-3 h-3 mr-1" /> Publié
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <EyeOff className="w-3 h-3 mr-1" /> Brouillon
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
