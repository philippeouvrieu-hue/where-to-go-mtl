import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Search, Heart, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const TopBar = () => {
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-md bg-gradient-primary shadow-glow animate-pulse-glow" />
          <div className="leading-none">
            <div className="font-display font-bold tracking-tight text-base">WHERE TO GO</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Montréal</div>
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
            <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground transition px-3 py-2">
              Déconnexion
            </button>
          ) : (
            <Link to="/auth" className="text-xs font-medium px-4 py-2 rounded-md bg-primary/10 text-primary-glow border border-primary/30 hover:bg-primary/20 transition">
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
    `px-3 py-2 rounded-md transition ${isActive ? "text-primary-glow" : "text-muted-foreground hover:text-foreground"}`
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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
          return (
            <Link key={to} to={to} className={`flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider ${active ? "text-primary-glow" : "text-muted-foreground"}`}>
              <Icon className="h-5 w-5" />{label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
