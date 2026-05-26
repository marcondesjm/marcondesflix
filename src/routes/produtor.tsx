import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Copy, ExternalLink, Link2, Megaphone, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/produtor")({
  component: ProducerPage,
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
  is_published: boolean;
};

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  cover_url: "",
  price: "197",
  headline: "",
  benefits: "Acesso imediato\nPagamento seguro\nGarantia de 7 dias",
  checkout_button: "Comprar agora",
};

function ProducerPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!session) navigate({ to: "/login" });
  }, [authLoading, session, navigate]);

  const loadProducts = async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("producer_products" as any)
      .select("*")
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setProducts(((data as Product[]) || []));
    setLoading(false);
  };

  useEffect(() => {
    if (session) loadProducts();
  }, [session]);

  const previewSlug = useMemo(() => form.slug || slugify(form.title), [form.slug, form.title]);

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    if (!form.title.trim()) return toast.error("Informe o nome do produto.");
    setSaving(true);

    const payload = {
      owner_id: session.user.id,
      title: form.title.trim(),
      slug: slugify(previewSlug || form.title),
      description: form.description || null,
      cover_url: form.cover_url || null,
      price: Number(form.price.replace(",", ".")) || 0,
      headline: form.headline || form.title,
      benefits: form.benefits.split("\n").map((item) => item.trim()).filter(Boolean),
      checkout_button: form.checkout_button || "Comprar agora",
      is_published: true,
    };

    const query = editingId
      ? supabase.from("producer_products" as any).update(payload).eq("id", editingId).select().single()
      : supabase.from("producer_products" as any).insert(payload).select().single();
    const { data, error } = await query;

    setSaving(false);
    if (error) return toast.error(error.message);
    if (editingId) {
      setProducts((items) => items.map((item) => (item.id === editingId ? data as Product : item)));
      toast.success("Produto atualizado!");
    } else {
      setProducts((items) => [data as Product, ...items]);
      toast.success("Checkout criado!");
    }
    setEditingId(null);
    setForm(emptyForm);
  };

  const edit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description || "",
      cover_url: product.cover_url || "",
      price: String(product.price || 0),
      headline: product.headline || "",
      benefits: (product.benefits || []).join("\n"),
      checkout_button: product.checkout_button || "Comprar agora",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este checkout?")) return;
    const { error } = await supabase.from("producer_products" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setProducts((items) => items.filter((item) => item.id !== id));
    toast.success("Checkout excluido.");
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Link copiado!");
  };

  if (authLoading || !session) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />
      <main className="pt-24 px-6 max-w-7xl mx-auto pb-24">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Megaphone className="w-4 h-4" /> Area do produtor
            </div>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">Checkout e divulgacao</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Crie uma pagina de venda simples, gere o checkout e divulgue seu link de pagamento.
            </p>
          </div>
          <Link to="/meus-cursos" className="text-sm text-muted-foreground hover:text-primary">
            Ver como aluno
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <form onSubmit={saveProduct} className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="font-display text-2xl">{editingId ? "EDITAR CHECKOUT" : "NOVO CHECKOUT"}</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">Preencha e gere seus links igual uma pagina de oferta.</p>

            <div className="space-y-3">
              <Field label="Nome do produto" value={form.title} required onChange={(value) => setForm({ ...form, title: value })} />
              <Field label="Slug do link" value={form.slug} placeholder={previewSlug || "meu-produto"} onChange={(value) => setForm({ ...form, slug: value })} />
              <Field label="Preco" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
              <Field label="Imagem de capa URL" value={form.cover_url} placeholder="https://..." onChange={(value) => setForm({ ...form, cover_url: value })} />
              <Field label="Chamada principal" value={form.headline} placeholder="Transforme sua promessa em venda" onChange={(value) => setForm({ ...form, headline: value })} />
              <TextArea label="Descricao" value={form.description} rows={3} onChange={(value) => setForm({ ...form, description: value })} />
              <TextArea label="Beneficios, um por linha" value={form.benefits} rows={4} onChange={(value) => setForm({ ...form, benefits: value })} />
              <Field label="Texto do botao" value={form.checkout_button} onChange={(value) => setForm({ ...form, checkout_button: value })} />
            </div>

            <button disabled={saving} className="mt-5 w-full rounded-md bg-gradient-red py-3 font-bold text-primary-foreground shadow-glow disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {saving ? "Salvando..." : editingId ? "Salvar checkout" : "Criar checkout"}
            </button>
          </form>

          <section className="space-y-4">
            <h2 className="font-display text-2xl">SEUS LINKS</h2>
            {loading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted-foreground">
                Nenhum checkout criado ainda.
              </div>
            ) : (
              products.map((product) => {
                const offerLink = `${window.location.origin}/oferta/${product.slug}`;
                const checkoutLink = `${window.location.origin}/checkout-produto/${product.id}`;
                return (
                  <article key={product.id} className="rounded-2xl border border-border bg-surface p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/30 via-red-950/60 to-black">
                        {product.cover_url && <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "Pagina de divulgacao pronta para compartilhar."}</p>
                        <div className="mt-2 text-xl font-display text-primary">R$ {Number(product.price).toFixed(2).replace(".", ",")}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => edit(product)} className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs font-bold hover:border-primary">
                          Editar
                        </button>
                        <button onClick={() => remove(product.id)} className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-muted-foreground hover:text-primary">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      <LinkBox label="Pagina de divulgacao" value={offerLink} onCopy={() => copy(offerLink)} />
                      <LinkBox label="Link de pagamento" value={checkoutLink} onCopy={() => copy(checkoutLink)} />
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function LinkBox({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Link2 className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="flex gap-2">
        <input readOnly value={value} className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2 text-xs text-muted-foreground" />
        <button onClick={onCopy} className="rounded-md bg-primary px-3 text-primary-foreground">
          <Copy className="w-4 h-4" />
        </button>
        <a href={value} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-2 text-muted-foreground hover:text-primary">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input {...rest} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function TextArea({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (value: string) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea {...rest} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}
