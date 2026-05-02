import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api, clearToken, getToken, setToken } from "@/lib/queryClient";

interface AdminUser {
  id?: number;
  username: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api<{ user: AdminUser }>("/api/admin/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api<{ token: string; user: AdminUser }>(
      "/api/admin/auth/login",
      { method: "POST", body: JSON.stringify({ username, password }) }
    );
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    navigate("/login");
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
