import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Search, Heart, Shield, UserCircle, Map } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const TopBar = () => {
  const { user, isAdmin } = useAuth();
  // Sur mobile : juste le safe-area-inset en haut, pas de barre visible
  // Sur desktop : nav complète
  return (
    <header className="sticky top-0 z-40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div
        className="hidden md:flex container items-center justify-between h-14 backdrop-blur-xl border-b"
        style={{ background: "rgba(8,8,16,0.85)", borderColor: "#1e1e2e" }}
      >
        <Link to="/" className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f0146b" }} />
          <span className="font-display font-black tracking-tight text-white">WHERE TO GO</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 ml-1">Montréal</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavItem to="/" label="Accueil" />
          <NavItem to="/search" label="Recherche" />
          <NavItem to="/saved" label="Favoris" />
          {isAdmin && <NavItem to="/admin" label="Admin" />}
        </nav>
        {!user && (
          <Link to="/auth" className="text-xs font-semibold px-4 py-2 rounded-full text-white transition"
            style={{ background: "rgba(240,20,107,0.15)", border: "1px solid rgba(240,20,107,0.3)", color: "#f0146b" }}>
            Connexion
          </Link>
        )}
      </div>
    </header>
  );
};

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink to={to} end className={({ isActive }) =>
    `px-3 py-2 rounded-md text-sm transition ${isActive ? "text-white font-semibold" : "text-white/40 hover:text-white"}`
  }>{label}</NavLink>
);

export const BottomNav = () => {
  const { isAdmin } = useAuth();
  const loc = useLocation();
  const items = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/search", icon: Search, label: "Recherche" },
    { to: "/map", icon: Map, label: "Carte" },
    { to: "/saved", icon: Heart, label: "Favoris" },
    { to: "/account", icon: UserCircle, label: "Compte" },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t"
      style={{ background: "rgba(8,8,16,0.92)", borderColor: "#1e1e2e", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className={`grid max-w-md mx-auto`} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
          return (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-1.5 py-3.5 text-[11px] font-medium tracking-wide transition-colors"
              style={{ color: active ? "#f0146b" : "rgba(255,255,255,0.3)" }}
            >
              <Icon className="h-6 w-6" />{label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
