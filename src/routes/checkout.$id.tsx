import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tag, CreditCard, Lock, ShieldCheck, Check, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/checkout/$id")({
  component: CheckoutPage,
});

type Course = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string | null;
};

const DEFAULT_PRICE = 197;
const INCLUDED = [
  "Acesso completo ao curso",
  "Acesso por Assinatura",
  "Certificado de conclusão",
];

function CheckoutPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate({ to: "/login" }); return; }
    (async () => {
      const { data } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
      setCourse(data);
      setLoading(false);
    })();
  }, [id, session, authLoading, navigate]);

  const total = Math.max(0, DEFAULT_PRICE - discount);

  const applyCoupon = () => {
    if (!coupon.trim()) return;
    // Cupom demonstrativo: DESCONTO10 = 10% off
    if (coupon.trim().toUpperCase() === "DESCONTO10") {
      setDiscount(DEFAULT_PRICE * 0.1);
      toast.success("Cupom aplicado: 10% de desconto");
    } else {
      setDiscount(0);
      toast.error("Cupom inválido");
    }
  };

  const pay = async () => {
    if (!session || !course) return;
    setSubmitting(true);
    try {
      // Registra a venda (status pending) — integração com gateway acontece no backend depois.
      const { error } = await supabase.from("sales").insert({
        user_id: session.user.id,
        course_id: course.id,
        amount: total,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Pedido criado! Você seria redirecionado ao Mercado Pago.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao processar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!course) return <div className="min-h-screen bg-background flex items-center justify-center">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />

      <div className="pt-24 px-6 max-w-6xl mx-auto pb-24">
        <Link to="/meus-cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Esquerda: resumo do pedido */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl">Resumo do Pedido</h1>
            <p className="text-muted-foreground mt-2">Revise os detalhes do seu pedido antes de confirmar.</p>

            <div className="mt-6 rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="aspect-[16/10] bg-surface-elevated overflow-hidden">
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
                )}
              </div>
              <div className="p-6">
                <h2 className="font-display text-2xl">{course.title}</h2>
                {course.description && (
                  <p className="text-muted-foreground mt-2 leading-relaxed">{course.description}</p>
                )}

                <div className="border-t border-border my-6" />

                <h3 className="font-bold mb-3">O que está incluído:</h3>
                <ul className="space-y-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-surface p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Garantia de 14 dias ou seu dinheiro de volta.</span>
            </div>
          </div>

          {/* Direita: pagamento */}
          <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-2xl mb-4">Pagamento</h2>

            <label className="text-sm text-muted-foreground">Possui um cupom?</label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="CÓDIGO DO CUPOM"
                  className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2.5 text-sm tracking-wider uppercase placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={applyCoupon}
                className="px-5 py-2.5 rounded-md bg-primary/10 border border-primary/40 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
              >
                Aplicar
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço original</span>
                <span>R$ {DEFAULT_PRICE.toFixed(2).replace(".", ",")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Desconto</span>
                  <span>- R$ {discount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parcelamento</span>
                <span>Até 12x no cartão</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-display text-xl">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 font-semibold">
                <CreditCard className="w-5 h-5" /> Pagamento Seguro
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Você será redirecionado para o Mercado Pago para concluir o pagamento com segurança.
              </p>
            </div>

            <button
              onClick={pay}
              disabled={submitting}
              className="mt-5 w-full bg-gradient-red text-primary-foreground py-3.5 rounded-md font-bold shadow-glow hover:scale-[1.01] transition-transform inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {submitting ? "Processando..." : `Pagar R$ ${total.toFixed(2).replace(".", ",")}`}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> Pagamento processado pelo Mercado Pago
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
