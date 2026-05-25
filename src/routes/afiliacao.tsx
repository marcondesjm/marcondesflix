import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShoppingCart, Link2, DollarSign, Shield, Star, ChevronDown, Users, Search } from "lucide-react";
import { toast } from "sonner";

const TABS = ["produtos", "minhas", "financeiro", "protecao"] as const;
type Tab = typeof TABS[number];

export const Route = createFileRoute("/afiliacao")({
  validateSearch: z.object({ t: z.enum(TABS).optional() }),
  component: AfiliacaoPage,
});

const NAV: { id: Tab; label: string; icon: any }[] = [
  { id: "produtos", label: "Produtos Disponíveis", icon: ShoppingCart },
  { id: "minhas", label: "Minhas Afiliações", icon: Link2 },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "protecao", label: "Dados de proteção", icon: Shield },
];

function AfiliacaoPage() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const tab: Tab = search.t ?? "produtos";

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/login" });
  }, [authLoading, session, navigate]);

  if (authLoading || !session) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <div className="pt-16 flex-1 flex">
        <Sidebar tab={tab} />
        <main className="flex-1 px-6 md:px-10 py-8">
          {tab === "produtos" && <ProdutosTab userId={session.user.id} />}
          {tab === "minhas" && <MinhasTab userId={session.user.id} />}
          {tab === "financeiro" && <FinanceiroTab userId={session.user.id} />}
          {tab === "protecao" && <ProtecaoTab userId={session.user.id} />}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

function Sidebar({ tab }: { tab: Tab }) {
  const { session } = useAuth();
  const name = session?.user.email?.split("@")[0] ?? "Usuário";
  return (
    <aside className="w-64 shrink-0 border-r border-border/50 bg-surface/30 hidden md:flex flex-col">
      <div className="p-4">
        <button className="w-full flex items-center justify-between text-sm font-semibold px-3 py-2 rounded-md bg-surface">
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Afiliação</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <nav className="mt-2 ml-2 flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <Link
                key={n.id}
                to="/afiliacao"
                search={{ t: n.id }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-surface"
                }`}
              >
                <Icon className="w-4 h-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-border/50">
        <div className="flex items-center gap-3 bg-surface rounded-md p-3">
          <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center font-bold text-primary uppercase">
            {name[0]}
          </div>
          <div className="text-sm">
            <div className="font-semibold capitalize">{name}</div>
            <div className="text-xs text-muted-foreground">Usuário</div>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
          className="mt-3 text-primary text-sm font-semibold flex items-center gap-2"
        >
          → Sair
        </button>
      </div>
    </aside>
  );
}

type Product = {
  id: string;
  course_id?: string;
  title: string;
  cover_url: string | null;
  commission_pct: number;
  price: number;
  product_type: string;
  requestable: boolean;
};

function ProdutosTab({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: ps }, { data: af }] = await Promise.all([
        supabase.from("affiliate_products").select("*").eq("is_active", true),
        supabase.from("affiliations").select("product_id").eq("user_id", userId),
      ]);
      const affiliateProducts = ((ps as any[]) || []).map((p) => ({
        ...p,
        requestable: true,
      }));

      if (affiliateProducts.length > 0) {
        setProducts(affiliateProducts);
      } else {
        const { data: courses } = await supabase
          .from("courses")
          .select("id,title,cover_url")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        setProducts(
          ((courses as any[]) || []).map((course) => ({
            id: `course:${course.id}`,
            course_id: course.id,
            title: course.title,
            cover_url: course.cover_url,
            commission_pct: 50,
            price: 0,
            product_type: "Curso",
            requestable: false,
          }))
        );
      }
      setMine(new Set((af || []).map((a: any) => a.product_id)));
      setLoading(false);
    })();
  }, [userId]);

  const request = async (pid: string) => {
    const { error } = await supabase.from("affiliations").insert({ user_id: userId, product_id: pid });
    if (error) return toast.error(error.message);
    setMine((s) => new Set(s).add(pid));
    toast.success("Afiliação solicitada!");
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase().trim())
  );

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <>
      <div className="flex items-center gap-3 mb-1">
        <ShoppingCart className="w-7 h-7 text-primary" />
        <h1 className="font-display text-3xl md:text-4xl">Produtos Disponíveis</h1>
      </div>
      <p className="text-muted-foreground mb-6">Encontre produtos para se afiliar e comece a ganhar comissões</p>

      <div className="relative max-w-3xl mb-8">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou descrição..."
          className="w-full bg-surface border border-border rounded-lg pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} requested={mine.has(p.id)} onRequest={() => request(p.id)} />
          ))}
        </div>
      )}
    </>
  );
}

function ProductCard({ product, requested, onRequest }: { product: Product; requested: boolean; onRequest: () => void }) {
  return (
    <article className="bg-surface/60 rounded-xl overflow-hidden border border-border/50 flex flex-col">
      <div className="aspect-video bg-surface overflow-hidden">
        {product.cover_url && <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover" />}
      </div>
      <div className="p-5 flex-1 flex flex-col gap-4">
        <h3 className="font-bold text-lg">{product.title}</h3>
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-muted-foreground uppercase tracking-wider">Comissão</div>
            <div className="text-emerald-400 font-bold text-xl">{product.commission_pct}%</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground uppercase tracking-wider">Preço</div>
            <div className="font-bold text-xl">R$ {Number(product.price).toFixed(2).replace(".", ",")}</div>
          </div>
        </div>
        <span className="self-start text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
          {product.product_type}
        </span>
        <button
          disabled={requested}
          onClick={() => {
            if (!product.requestable) {
              toast.info("Curso publicado listado. Para receber solicitacoes, habilite este curso como produto de afiliacao no painel admin.");
              return;
            }
            onRequest();
          }}
          className="mt-auto w-full bg-gradient-red text-primary-foreground font-bold py-3 rounded-md flex items-center justify-center gap-2 shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Star className="w-4 h-4" /> {requested ? "Solicitada" : product.requestable ? "Solicitar Afiliação" : "Produto do Curso"}
        </button>
      </div>
    </article>
  );
}

function MinhasTab({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("affiliations")
      .select("id,status,created_at,affiliate_products(title,commission_pct,price)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data || []));
  }, [userId]);
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Minhas Afiliações</h1>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não solicitou nenhuma afiliação.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-surface/60 border border-border/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.affiliate_products?.title}</div>
                <div className="text-xs text-muted-foreground">Comissão {r.affiliate_products?.commission_pct}% • R$ {Number(r.affiliate_products?.price).toFixed(2)}</div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                r.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                r.status === "rejected" ? "bg-red-500/20 text-red-400" :
                "bg-amber-500/20 text-amber-400"
              }`}>
                {r.status === "approved" ? "Aprovada" : r.status === "rejected" ? "Rejeitada" : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function FinanceiroTab({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("affiliate_payouts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(({ data }) => setRows(data || []));
  }, [userId]);
  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Financeiro</h1>
      <div className="bg-surface/60 border border-border/50 rounded-xl p-6 mb-6">
        <div className="text-sm text-muted-foreground">Saldo acumulado</div>
        <div className="text-3xl font-bold text-emerald-400">R$ {total.toFixed(2).replace(".", ",")}</div>
      </div>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">Nenhum lançamento financeiro ainda.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="bg-surface/60 border border-border/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.description ?? "Comissão"}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</div>
              </div>
              <div className="font-bold">R$ {Number(r.amount).toFixed(2).replace(".", ",")}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ProtecaoTab({ userId }: { userId: string }) {
  const [data, setData] = useState({ full_name: "", document: "", phone: "", address: "", pix_key: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("protection_data").select("*").eq("user_id", userId).maybeSingle().then(({ data: d }) => {
      if (d) setData({ full_name: d.full_name ?? "", document: d.document ?? "", phone: d.phone ?? "", address: d.address ?? "", pix_key: d.pix_key ?? "" });
      setLoading(false);
    });
  }, [userId]);

  const save = async () => {
    const { error } = await supabase.from("protection_data").upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Dados salvos!");
  };

  if (loading) return null;
  const field = (k: keyof typeof data, label: string) => (
    <label className="block">
      <span className="text-sm font-semibold mb-1 block">{label}</span>
      <input
        value={data[k]}
        onChange={(e) => setData({ ...data, [k]: e.target.value })}
        className="w-full px-4 py-2 rounded-md bg-surface border border-border/50 focus:border-primary outline-none"
      />
    </label>
  );

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dados de proteção</h1>
      <div className="max-w-2xl space-y-4 bg-surface/60 border border-border/50 rounded-xl p-6">
        {field("full_name", "Nome completo")}
        {field("document", "CPF / CNPJ")}
        {field("phone", "Telefone")}
        {field("address", "Endereço")}
        {field("pix_key", "Chave PIX")}
        <button onClick={save} className="bg-gradient-red text-primary-foreground font-bold px-6 py-2 rounded-md shadow-glow">
          Salvar
        </button>
      </div>
    </>
  );
}
