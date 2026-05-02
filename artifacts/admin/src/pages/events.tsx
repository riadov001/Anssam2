import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Calendar, Loader2 } from "lucide-react";

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

interface IslamicEvent {
  id: number;
  name: string;
  nameAr?: string | null;
  nameFr?: string | null;
  description?: string | null;
  hijriDay: number;
  hijriMonth: number;
  type: string;
  importance: string;
  isActive: boolean;
}

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah",
];
const TYPES = ["holiday", "fast", "commemoration", "blessed_night"];
const IMPORTANCE = ["high", "medium", "low"];

const blankForm: Partial<IslamicEvent> = {
  name: "", nameFr: "", nameAr: "", description: "",
  hijriDay: 1, hijriMonth: 1, type: "holiday", importance: "medium", isActive: true,
};

export default function EventsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IslamicEvent | null>(null);
  const [form, setForm] = useState<Partial<IslamicEvent>>(blankForm);

  const { data, isLoading } = useQuery<{ events: IslamicEvent[] }>({
    queryKey: ["admin-events"],
    queryFn: () => api("/api/admin/events"),
  });

  const saveMut = useMutation({
    mutationFn: (payload: Partial<IslamicEvent>) => {
      if (editing) {
        return api(`/api/admin/events/${editing.id}`, {
          method: "PUT", body: JSON.stringify(payload),
        });
      }
      return api("/api/admin/events", {
        method: "POST", body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setOpen(false);
      setEditing(null);
      setForm(blankForm);
      toast({ title: editing ? "Événement mis à jour" : "Événement ajouté" });
    },
    onError: (err: Error) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api(`/api/admin/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Événement supprimé" });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setOpen(true);
  };
  const openEdit = (ev: IslamicEvent) => {
    setEditing(ev);
    setForm({ ...ev });
    setOpen(true);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveMut.mutate(form);
  };

  const importanceColor: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <AdminLayout title="Agenda islamique" subtitle="Événements du calendrier hijri affichés dans l'app">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {data?.events?.length ?? 0} événement{(data?.events?.length ?? 0) > 1 ? "s" : ""}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} data-testid="button-new-event" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label>Nom *</Label>
                <Input
                  data-testid="input-event-name"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nom (FR)</Label>
                  <Input value={form.nameFr || ""} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} />
                </div>
                <div>
                  <Label>Nom (AR)</Label>
                  <Input dir="rtl" value={form.nameAr || ""} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Jour Hijri *</Label>
                  <Input
                    type="number" min={1} max={30}
                    value={form.hijriDay ?? 1}
                    onChange={(e) => setForm({ ...form, hijriDay: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div>
                  <Label>Mois Hijri *</Label>
                  <Select
                    value={String(form.hijriMonth)}
                    onValueChange={(v) => setForm({ ...form, hijriMonth: parseInt(v) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HIJRI_MONTHS.map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{i + 1} — {m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Importance</Label>
                  <Select value={form.importance} onValueChange={(v) => setForm({ ...form, importance: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {IMPORTANCE.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <Label htmlFor="active" className="cursor-pointer">Actif</Label>
                <Switch
                  id="active"
                  checked={form.isActive ?? true}
                  onCheckedChange={(c) => setForm({ ...form, isActive: c })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
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
      ) : data?.events?.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Aucun événement</p>
          <p className="text-sm text-slate-500 mt-1">Ajoutez vos premiers événements islamiques.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data?.events?.map((ev) => (
            <Card key={ev.id} data-testid={`event-${ev.id}`} className="p-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex flex-col items-center justify-center flex-shrink-0 border border-emerald-200/50 dark:border-emerald-900/50">
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 leading-none">{ev.hijriDay}</span>
                  <span className="text-[10px] text-emerald-600/70 mt-1">{HIJRI_MONTHS[ev.hijriMonth - 1]?.slice(0, 6)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {ev.nameFr || ev.name}
                        {ev.nameAr && <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-normal">{ev.nameAr}</span>}
                      </p>
                      {ev.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(ev)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        onClick={() => { if (confirm(`Supprimer "${ev.nameFr || ev.name}" ?`)) deleteMut.mutate(ev.id); }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary">{ev.type}</Badge>
                    <Badge className={importanceColor[ev.importance]}>{ev.importance}</Badge>
                    {!ev.isActive && <Badge variant="outline">Inactif</Badge>}
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
