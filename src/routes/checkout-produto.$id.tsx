import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Check, CreditCard, Lock, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout-produto/$id")({
  component: ProducerCheckoutPage,
});

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  price: number;
  benefits: string[] | null;
  checkout_button: string | null;
};

function ProducerCheckoutPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("producer_products" as any)
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();
      setProduct((data as Product) || null);
      setLoading(false);
    })();
  }, [id]);

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    if (!product) return;
    setSubmitting(true);
    const { error } = await supabase.from("producer_orders" as any).insert({
      product_id: product.id,
      customer_name: customer.name,
      customer_email: customer.email,
      amount: Number(product.price) || 0,
      status: "pending",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Pedido criado! Aqui entra o redirecionamento para o gateway de pagamento.");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!product) return <div className="min-h-screen bg-background flex items-center justify-center">Checkout nao encontrado.</div>;

  const benefits = product.benefits?.length ? product.benefits : ["Acesso imediato", "Pagamento seguro", "Garantia de 7 dias"];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/oferta/$slug" params={{ slug: product.slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Voltar para oferta
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Lock className="h-4 w-4" /> Checkout seguro
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <h1 className="font-display text-4xl md:text-5xl">Finalize sua compra</h1>
          <p className="mt-2 text-muted-foreground">Preencha seus dados para gerar o pedido de pagamento.</p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="aspect-video bg-gradient-to-br from-primary/30 via-red-950/70 to-black">
              {product.cover_url && <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-6">
              <h2 className="font-display text-3xl">{product.title}</h2>
              {product.description && <p className="mt-2 text-muted-foreground">{product.description}</p>}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {benefits.map((item) => (
                  <div key={item} className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                    <Check className="mb-2 h-4 w-4 text-primary" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Ambiente seguro. Seus dados ficam protegidos.</span>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-card lg:sticky lg:top-6">
          <h2 className="font-display text-2xl">Pagamento</h2>
          <div className="mt-4 rounded-xl border border-border bg-background/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Produto</span>
              <span className="font-semibold text-right">{product.title}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl text-primary">R$ {Number(product.price).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          <form onSubmit={pay} className="mt-5 space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Nome completo</span>
              <input
                required
                value={customer.name}
                onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-3 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <input
                required
                type="email"
                value={customer.email}
                onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-3 outline-none focus:border-primary"
              />
            </label>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 font-semibold">
                <CreditCard className="h-5 w-5" /> Cartao, Pix ou boleto
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Pedido criado na plataforma. A proxima etapa e conectar Mercado Pago, Stripe ou outro gateway.
              </p>
            </div>

            <button disabled={submitting} className="w-full rounded-md bg-gradient-red py-3.5 font-bold text-primary-foreground shadow-glow disabled:opacity-60 inline-flex items-center justify-center gap-2">
              <Tag className="h-4 w-4" />
              {submitting ? "Gerando pedido..." : product.checkout_button || "Comprar agora"}
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
}
