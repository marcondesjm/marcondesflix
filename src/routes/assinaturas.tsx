import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/assinaturas")({
  component: AssinaturasPage,
});

type Sale = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  course_id: string | null;
  course?: { title: string } | null;
};

function AssinaturasPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate({ to: "/login" }); return; }
    (async () => {
      const { data } = await supabase
        .from("sales")
        .select("id, amount, status, created_at, course_id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      const withCourse = await Promise.all(
        (data || []).map(async (s) => {
          if (!s.course_id) return { ...s, course: null };
          const { data: c } = await supabase.from("courses").select("title").eq("id", s.course_id).maybeSingle();
          return { ...s, course: c };
        })
      );
      setSales(withCourse);
      setLoading(false);
    })();
  }, [session, authLoading, navigate]);

  const active = sales.filter((s) => s.status === "paid");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />
      <div className="pt-24 px-6 max-w-3xl mx-auto pb-24">
        <Link to="/meus-cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="font-display text-3xl md:text-4xl">Minhas Assinaturas</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas assinaturas e histórico de compras</p>

        <section className="mt-8">
          <h2 className="font-display text-xl mb-3">Assinaturas</h2>
          <div className="rounded-2xl border border-border bg-surface p-8">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : active.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <CreditCard className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground">Você não possui assinaturas ativas</p>
                <Link to="/meus-cursos" className="bg-gradient-red text-primary-foreground px-5 py-2.5 rounded-md font-bold shadow-glow hover:scale-[1.02] transition-transform text-sm">
                  Ver Produtos Disponíveis
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {active.map((s) => (
                  <li key={s.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-border">
                    <div>
                      <div className="font-semibold">{s.course?.title || "Produto"}</div>
                      <div className="text-xs text-muted-foreground">Ativa desde {new Date(s.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <span className="text-sm font-bold">R$ {Number(s.amount).toFixed(2).replace(".", ",")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl mb-3">Histórico de Compras</h2>
          <div className="rounded-2xl border border-border bg-surface p-8">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : sales.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhuma compra realizada</p>
            ) : (
              <ul className="divide-y divide-border">
                {sales.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold text-sm">{s.course?.title || "Produto"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("pt-BR")} · <span className="capitalize">{s.status}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold">R$ {Number(s.amount).toFixed(2).replace(".", ",")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
