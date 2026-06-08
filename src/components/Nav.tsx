import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Search, Heart, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const TopBar = () => {
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b"
      style={{ background: "rgba(8,8,16,0.85)", borderColor: "#1e1e2e", paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg flex-shrink-0" style={{ background: "linear-gradient(135deg, #f0146b, #7c3aed)" }} />
          <div className="leading-none">
            <div className="font-display font-black tracking-tighter text-sm text-white">WHERE TO GO</div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/30">Montréal</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavItem to="/" label="Accueil" />
          <NavItem to="/search" label="Recherche" />
          <NavItem to="/saved" label="Favoris" />
          {isAdmin && <NavItem to="/admin" label="Admin" />}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <button onClick={signOut} className="text-xs text-white/40 hover:text-white transition px-3 py-2">
              Déconnexion
            </button>
          ) : (
            <Link to="/auth" className="text-xs font-semibold px-4 py-2 rounded-full text-white transition"
              style={{ background: "rgba(240,20,107,0.15)", border: "1px solid rgba(240,20,107,0.3)", color: "#f0146b" }}>
              Connexion
            </Link>
          )}
        </div>
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
    { to: "/saved", icon: Heart, label: "Favoris" },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t"
      style={{ background: "rgba(8,8,16,0.92)", borderColor: "#1e1e2e", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
          return (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider transition-colors"
              style={{ color: active ? "#f0146b" : "rgba(255,255,255,0.3)" }}
            >
              <Icon className="h-5 w-5" />{label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
