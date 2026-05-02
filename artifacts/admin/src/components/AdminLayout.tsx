import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  PlayCircle,
  Calendar,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/videos", label: "Vidéos", icon: PlayCircle },
  { href: "/events", label: "Agenda islamique", icon: Calendar },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">
                Anssam
              </h2>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 -mt-0.5">
                أنسام · Admin
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? location === "/" : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.href.slice(1) || "home"}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase">
              {user?.username?.[0] ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.role || "admin"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            data-testid="button-logout"
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 md:px-8 py-5">
          <h1
            data-testid="page-title"
            className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
