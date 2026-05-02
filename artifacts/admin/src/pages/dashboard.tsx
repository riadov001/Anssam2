import { useQuery } from "@tanstack/react-query";
import { PlayCircle, Calendar, MessageSquare, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/queryClient";

interface Stats {
  totalVideos: number;
  publishedVideos: number;
  islamicEvents: number;
  aiConversations: number;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<{ stats: Stats }>({
    queryKey: ["admin-stats"],
    queryFn: () => api("/api/admin/stats"),
  });

  const stats = data?.stats;

  const cards = [
    {
      label: "Vidéos publiées",
      value: stats?.publishedVideos ?? "—",
      total: stats?.totalVideos,
      icon: CheckCircle2,
      color: "emerald",
      href: "/videos",
    },
    {
      label: "Vidéos totales",
      value: stats?.totalVideos ?? "—",
      icon: PlayCircle,
      color: "blue",
      href: "/videos",
    },
    {
      label: "Événements islamiques",
      value: stats?.islamicEvents ?? "—",
      icon: Calendar,
      color: "amber",
      href: "/events",
    },
    {
      label: "Conversations IA Nour",
      value: stats?.aiConversations ?? "—",
      icon: MessageSquare,
      color: "purple",
      href: "/",
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <AdminLayout
      title="Tableau de bord"
      subtitle="Vue d'ensemble de votre application Anssam"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}>
              <Card
                data-testid={`stat-${c.label.toLowerCase().replace(/\s/g, "-")}`}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[c.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {isLoading ? "…" : c.value}
                  {c.total !== undefined && (
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {c.total}
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {c.label}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/videos">
            <Card className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-slate-200 dark:border-slate-800">
              <PlayCircle className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Ajouter une vidéo</p>
              <p className="text-xs text-slate-500 mt-1">YouTube ou lien direct</p>
            </Card>
          </Link>
          <Link href="/events">
            <Card className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-slate-200 dark:border-slate-800">
              <Calendar className="w-6 h-6 text-amber-600 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Événement islamique</p>
              <p className="text-xs text-slate-500 mt-1">Date Hijri, type, importance</p>
            </Card>
          </Link>
          <Link href="/settings">
            <Card className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Paramètres globaux</p>
              <p className="text-xs text-slate-500 mt-1">Configuration de l'app</p>
            </Card>
          </Link>
        </div>
      </Card>
    </AdminLayout>
  );
}
