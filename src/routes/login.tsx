import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/meus-cursos" });
  };

  const handleGoogle = async () => {
    toast.info("Login com Google em breve. Use email/senha por enquanto.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 bg-hero-glow">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-gradient-red rounded-md p-2 shadow-glow"><Play className="w-5 h-5 fill-white text-white" /></div>
          <span className="font-display text-3xl tracking-wider">Creators<span className="text-primary">FLIX</span></span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-card">
          <h1 className="font-display text-3xl mb-2">ENTRAR</h1>
          <p className="text-sm text-muted-foreground mb-6">Acesse sua área de membros</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded-md px-4 py-3 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Senha</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded-md px-4 py-3 focus:border-primary outline-none"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-red text-primary-foreground py-3 rounded-md font-bold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading ? "Entrando..." : "ENTRAR"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full bg-surface-elevated border border-border py-3 rounded-md font-semibold hover:border-primary transition-colors"
          >
            Continuar com Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
