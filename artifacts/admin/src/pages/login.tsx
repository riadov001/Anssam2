import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur border-emerald-900/40 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Anssam Admin
          </h1>
          <p className="text-sm text-emerald-400/70 mt-1">أنسام · Espace administration</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-slate-200">
              Identifiant
            </Label>
            <Input
              id="username"
              data-testid="input-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              className="mt-1.5 bg-slate-800/60 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-slate-200">
              Mot de passe
            </Label>
            <Input
              id="password"
              data-testid="input-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1.5 bg-slate-800/60 border-slate-700 text-white"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            data-testid="button-login"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Se connecter"}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Première connexion : votre compte sera créé automatiquement.
          </p>
        </form>
      </Card>
      <p className="absolute bottom-4 text-xs text-slate-600">
        Straight Path Intelligence — L'intelligence au service de la spiritualité
      </p>
    </div>
  );
}
