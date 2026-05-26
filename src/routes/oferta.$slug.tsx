import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Lock, Play, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/oferta/$slug")({
  component: OfferPage,
});

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  price: number;
  headline: string | null;
  benefits: string[] | null;
  checkout_button: string | null;
};

function OfferPage() {
  const { slug } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("producer_products" as any)
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setProduct((data as Product) || null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!product) return <div className="min-h-screen bg-background flex items-center justify-center">Oferta nao encontrada.</div>;

  const benefits = product.benefits?.length ? product.benefits : ["Acesso imediato", "Pagamento seguro", "Garantia de 7 dias"];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-gradient-red p-1.5 shadow-glow">
              <Play className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-display text-2xl">Marcondes<span className="text-primary">Flix</span></span>
          </Link>
          <Link to="/checkout-produto/$id" params={{ id: product.id }} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow">
            Comprar
          </Link>
        </div>
      </header>

      <main>
        <section className="relative px-6 py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(229,9,20,0.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.08),transparent_24%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_460px] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                <Star className="h-4 w-4" /> Oferta oficial
              </div>
              <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
                {product.headline || product.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {product.description || "Pagina pronta para apresentar sua oferta, destacar beneficios e levar direto para o checkout."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/checkout-produto/$id" params={{ id: product.id }} className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-red px-8 py-4 font-bold text-primary-foreground shadow-glow">
                  {product.checkout_button || "Comprar agora"} <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-4 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" /> Checkout seguro
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-surface p-5 shadow-card">
              <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-red-950/70 to-black">
                {product.cover_url && <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover" />}
              </div>
              <div className="p-3">
                <h2 className="mt-3 font-bold text-xl">{product.title}</h2>
                <div className="mt-4 font-display text-4xl text-primary">
                  R$ {Number(product.price).toFixed(2).replace(".", ",")}
                </div>
                <Link to="/checkout-produto/$id" params={{ id: product.id }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">
                  Ir para pagamento <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y border-border bg-surface/40 px-6 py-12">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-border bg-background/60 p-5">
                <Check className="h-5 w-5 text-primary" />
                <div className="mt-3 font-bold">{benefit}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center rounded-3xl border border-primary/30 bg-primary/10 p-8 text-center">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-4xl">Pronto para comecar?</h2>
            <p className="mt-2 text-muted-foreground">Clique no botao abaixo e finalize sua compra com seguranca.</p>
            <Link to="/checkout-produto/$id" params={{ id: product.id }} className="mt-6 rounded-md bg-gradient-red px-8 py-4 font-bold text-primary-foreground shadow-glow">
              {product.checkout_button || "Comprar agora"}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
