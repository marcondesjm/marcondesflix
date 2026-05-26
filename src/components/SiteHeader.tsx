import { Link } from "@tanstack/react-router";
import { Play, Shield, LogOut, User as UserIcon, CreditCard, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader({ authed }: { authed?: boolean }) {
  const { isAdmin, session } = useAuth();
  const showAuthed = authed ?? !!session;
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("avatar_url, full_name").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setName(data.full_name || session.user.email || "");
        }
      });
  }, [session]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group min-w-0" onClick={() => setMobileOpen(false)}>
          <div className="bg-gradient-red rounded-md p-1.5 shadow-glow group-hover:scale-105 transition-transform shrink-0">
            <Play className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="font-display text-lg sm:text-2xl tracking-wider truncate">
            Marcondes<span className="text-primary">Flix</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {showAuthed ? (
            <>
              <Link to="/meus-cursos" className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-surface transition-colors" activeProps={{ className: "text-primary" }}>
                Meus Cursos
              </Link>
              <Link to="/afiliacao" className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-surface transition-colors" activeProps={{ className: "text-primary" }}>
                AfiliaÃ§Ã£o
              </Link>
              <Link to="/produtor" className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-surface transition-colors" activeProps={{ className: "text-primary" }}>
                Produtor
              </Link>
              {isAdmin && (
                <Link to="/admin" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-surface transition-colors flex items-center gap-1" activeProps={{ className: "text-primary" }}>
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}

              <div className="relative ml-2" ref={ref}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface transition-colors border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-elevated overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-60 bg-surface border border-border rounded-xl shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="text-sm font-semibold truncate">{name || "UsuÃ¡rio"}</div>
                      <div className="text-xs text-muted-foreground truncate">{session?.user.email}</div>
                    </div>
                    <Link to="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-elevated transition-colors">
                      <UserIcon className="w-4 h-4" /> Meu Perfil
                    </Link>
                    <Link to="/assinaturas" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-elevated transition-colors">
                      <CreditCard className="w-4 h-4" /> Minhas Assinaturas
                    </Link>
                    <button
                      onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-elevated transition-colors text-muted-foreground border-t border-border"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-surface transition-colors">
                Entrar
              </Link>
              <Link to="/signup" className="bg-gradient-red text-primary-foreground px-5 py-2 text-sm font-bold rounded-md shadow-glow hover:scale-105 transition-transform">
                ComeÃ§ar
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 rounded-md hover:bg-surface transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="px-4 py-4 flex flex-col gap-1 max-w-7xl mx-auto">
            {showAuthed ? (
              <>
                <div className="flex items-center gap-3 p-3 mb-2 bg-surface rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-full bg-surface-elevated overflow-hidden flex items-center justify-center shrink-0">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{name || "UsuÃ¡rio"}</div>
                    <div className="text-xs text-muted-foreground truncate">{session?.user.email}</div>
                  </div>
                </div>
                <Link to="/meus-cursos" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-semibold rounded-md hover:bg-surface transition-colors">Meus Cursos</Link>
                <Link to="/afiliacao" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-semibold rounded-md hover:bg-surface transition-colors">AfiliaÃ§Ã£o</Link>
                <Link to="/produtor" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-semibold rounded-md hover:bg-surface transition-colors">Produtor</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-semibold rounded-md hover:bg-surface transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                <Link to="/perfil" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm rounded-md hover:bg-surface transition-colors flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Meu Perfil
                </Link>
                <Link to="/assinaturas" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm rounded-md hover:bg-surface transition-colors flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Minhas Assinaturas
                </Link>
                <button
                  onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
                  className="text-left px-4 py-3 text-sm rounded-md hover:bg-surface transition-colors flex items-center gap-2 text-muted-foreground border-t border-border mt-2"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-semibold rounded-md hover:bg-surface transition-colors text-center border border-border">
                  Entrar
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="bg-gradient-red text-primary-foreground px-5 py-3 text-sm font-bold rounded-md shadow-glow text-center">
                  ComeÃ§ar
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

