import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Search, Heart, Shield, UserCircle, Map } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";

export const TopBar = () => {
  const { user, isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div
        className="hidden md:flex container items-center justify-between h-14 border-b"
        style={{
          background: "rgba(8,8,8,0.88)",
          borderColor: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#E8500A" }} />
          <span className="font-editorial text-white font-normal text-lg italic">What's the Move</span>
          <span className="font-mono-label text-[9px] uppercase tracking-[0.3em] ml-1" style={{ color: "rgba(255,255,255,0.28)" }}>Montréal</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavItem to="/" label="Accueil" />
          <NavItem to="/search" label="Recherche" />
          <NavItem to="/saved" label="Favoris" />
          {isAdmin && <NavItem to="/admin" label="Admin" />}
        </nav>
        {!user && (
          <Link to="/auth" className="font-mono-label text-xs font-bold px-4 py-2 rounded-full transition"
            style={{ background: "rgba(232,80,10,0.12)", border: "1px solid rgba(232,80,10,0.3)", color: "#E8500A" }}>
            Connexion
          </Link>
        )}
      </div>
    </header>
  );
};

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink to={to} end className={({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? "text-white" : "text-white/35 hover:text-white/70"}`
  }>{label}</NavLink>
);

export const BottomNav = () => {
  const { isAdmin } = useAuth();
  const loc = useLocation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY;
      if (curr < 60) { setVisible(true); }
      else if (curr > lastScrollY.current + 8) { setVisible(false); }
      else if (curr < lastScrollY.current - 8) { setVisible(true); }
      lastScrollY.current = curr;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/search", icon: Search, label: "Chercher" },
    { to: "/map", icon: Map, label: "Carte" },
    { to: "/saved", icon: Heart, label: "Favoris" },
    { to: "/account", icon: UserCircle, label: "Profil" },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 transition-transform duration-300"
      style={{
        transform: visible ? "translateY(0)" : "translateY(110%)",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "rgba(8,8,8,0.88)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(255,255,255,0.055)",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.5), 0 -1px 0 rgba(232,80,10,0.08)",
      }}
    >
      <div className="grid max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 py-3 relative transition-all duration-200"
              style={{ color: active ? "#E8500A" : "rgba(255,255,255,0.28)" }}
            >
              <Icon
                className="transition-all duration-200"
                style={{
                  width: active ? 26 : 22,
                  height: active ? 26 : 22,
                }}
              />
              <span className="font-mono-label" style={{ fontSize: 9, letterSpacing: "0.04em" }}>{label}</span>
              {/* Active dot */}
              {active && (
                <div
                  className="absolute bottom-0 left-1/2"
                  style={{
                    width: 16,
                    height: 2,
                    background: "#E8500A",
                    borderRadius: "2px 2px 0 0",
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 8px rgba(232,80,10,0.6)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
