import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin + "/meus-cursos",
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu email.");
    navigate({ to: "/meus-cursos" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 bg-hero-glow">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-gradient-red rounded-md p-2 shadow-glow"><Play className="w-5 h-5 fill-white text-white" /></div>
          <span className="font-display text-3xl tracking-wider">Creators<span className="text-primary">FLIX</span></span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-card">
          <h1 className="font-display text-3xl mb-2">CRIAR CONTA</h1>
          <p className="text-sm text-muted-foreground mb-6">Comece sua jornada como criador</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Nome</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded-md px-4 py-3 focus:border-primary outline-none"
              />
            </div>
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
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded-md px-4 py-3 focus:border-primary outline-none"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-red text-primary-foreground py-3 rounded-md font-bold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading ? "Criando..." : "CRIAR CONTA"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
