import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen, Users, Shield, Upload, Menu } from "lucide-react";
import { AdminSidebar, type AdminSection } from "@/components/AdminSidebar";
import { SimpleCrud } from "@/components/admin/SimpleCrud";
import { ModulesAdmin, LessonsAdmin, UsersAdmin, CommentsAdmin, SettingsAdmin, SalesAdmin } from "@/components/admin/sections";
import { PaymentGateways } from "@/components/admin/PaymentGateways";

const VALID_SECTIONS: AdminSection[] = [
  "dashboard","paginas","empresas","vendas","categorias",
  "cursos","modulos","aulas","usuarios","config","comentarios","pagamentos",
];

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): { s: AdminSection } => {
    const s = search.s as AdminSection;
    return { s: VALID_SECTIONS.includes(s) ? s : "dashboard" };
  },
  component: AdminPage,
});

type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_url: string | null;
  is_published: boolean;
};

function AdminPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ users: 0, enrollments: 0 });
  const [form, setForm] = useState({ title: "", description: "", category: "", cover_url: "" });
  const [uploading, setUploading] = useState(false);
  const search = Route.useSearch();
  const section = search.s as AdminSection;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // close mobile sidebar on section change
  useEffect(() => { setSidebarOpen(false); }, [section]);

  useEffect(() => {
    if (loading) return;
    if (!session) { navigate({ to: "/login" }); return; }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ data: cs }, { count: uc }, { count: ec }] = await Promise.all([
        supabase.from("courses").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
      ]);
      setCourses(cs || []);
      setStats({ users: uc || 0, enrollments: ec || 0 });
    })();
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-primary mx-auto" />
          <h1 className="font-display text-3xl mt-4">ACESSO RESTRITO</h1>
          <p className="text-muted-foreground mt-2">Você precisa ser administrador para acessar esta área.</p>
        </div>
      </div>
    );
  }

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error, data } = await supabase.from("courses").insert(form).select().single();
    if (error) return toast.error(error.message);
    setCourses((c) => [data as Course, ...c]);
    setForm({ title: "", description: "", category: "", cover_url: "" });
    toast.success("Curso criado!");
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Excluir este curso e todas as aulas?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCourses((c) => c.filter((x) => x.id !== id));
    toast.success("Curso excluído");
  };

  const togglePublish = async (c: Course) => {
    const { error } = await supabase.from("courses").update({ is_published: !c.is_published }).eq("id", c.id);
    if (error) return toast.error(error.message);
    setCourses((cs) => cs.map((x) => (x.id === c.id ? { ...x, is_published: !c.is_published } : x)));
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session!.user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("course-covers").upload(path, file, {
      cacheControl: "3600", upsert: false,
    });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("course-covers").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_url: data.publicUrl }));
    setUploading(false);
    toast.success("Capa enviada");
  };

  const sectionTitles: Record<AdminSection, string> = {
    dashboard: "Dashboard",
    paginas: "Gerenciar Páginas",
    empresas: "Gerenciar Empresas",
    vendas: "Gestão de Vendas",
    categorias: "Gerenciar Categorias",
    cursos: "Gerenciar Cursos",
    modulos: "Gerenciar Módulos",
    aulas: "Gerenciar Aulas",
    usuarios: "Gerenciar Usuários",
    config: "Configurações",
    comentarios: "Moderar Comentários",
    pagamentos: "Configurações de Pagamento",
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        active={section}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-surface rounded-md"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl md:text-2xl">{sectionTitles[section].toUpperCase()}</h1>
          <Link to="/" className="ml-auto text-xs text-muted-foreground hover:text-primary">
            ← Voltar ao site
          </Link>
        </div>

        <div className="p-6 max-w-6xl">
          {section === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Stat icon={BookOpen} label="Cursos" value={courses.length} />
                <Stat icon={Users} label="Alunos" value={stats.users} />
                <Stat icon={Shield} label="Matrículas" value={stats.enrollments} />
              </div>
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="font-display text-xl mb-2">Bem-vindo ao painel</h2>
                <p className="text-sm text-muted-foreground">Use o menu à esquerda para gerenciar conteúdos da plataforma.</p>
              </div>
            </div>
          )}

          {section === "cursos" && (
            <div className="grid lg:grid-cols-[400px_1fr] gap-8">
              <form onSubmit={createCourse} className="bg-surface border border-border rounded-xl p-6 h-fit">
                <h2 className="font-display text-2xl mb-4">NOVO CURSO</h2>
                <div className="space-y-3">
                  <Input label="Título" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
                  <Input label="Categoria" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Marketing, Tech, ..." />
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Capa do curso</label>
                    {form.cover_url ? (
                      <div className="mt-1 relative rounded-md overflow-hidden border border-border">
                        <img src={form.cover_url} alt="" className="w-full aspect-video object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, cover_url: "" })}
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded border border-border hover:border-primary"
                        >
                          Trocar
                        </button>
                      </div>
                    ) : (
                      <label className="mt-1 flex flex-col items-center justify-center gap-2 aspect-video bg-input border border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors text-muted-foreground text-sm">
                        <Upload className="w-5 h-5" />
                        <span>{uploading ? "Enviando..." : "Clique para enviar imagem"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</label>
                    <textarea
                      value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <button type="submit" className="w-full bg-gradient-red py-3 rounded-md font-bold shadow-glow inline-flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Criar curso
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <h2 className="font-display text-2xl">CURSOS</h2>
                {courses.map((c) => (
                  <div key={c.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                    <div className="w-24 h-14 rounded overflow-hidden bg-surface-elevated flex-shrink-0">
                      {c.cover_url && <img src={c.cover_url} alt={c.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.category || "Sem categoria"}</div>
                    </div>
                    <button
                      onClick={() => togglePublish(c)}
                      className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                        c.is_published ? "bg-primary/20 text-primary" : "bg-surface-elevated text-muted-foreground"
                      }`}
                    >
                      {c.is_published ? "Publicado" : "Rascunho"}
                    </button>
                    <Link to="/admin/curso/$id" params={{ id: c.id }} className="text-xs px-3 py-1.5 rounded bg-surface-elevated border border-border hover:border-primary font-semibold">
                      Aulas
                    </Link>
                    <button onClick={() => deleteCourse(c.id)} className="p-2 text-muted-foreground hover:text-primary">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {!courses.length && <div className="text-sm text-muted-foreground py-8 text-center">Nenhum curso ainda. Crie o primeiro ao lado.</div>}
              </div>
            </div>
          )}

          {section === "categorias" && (
            <SimpleCrud
              table="categories"
              title="Nova categoria"
              fields={[
                { key: "name", label: "Nome", required: true, placeholder: "Marketing" },
                { key: "slug", label: "Slug", required: true, placeholder: "marketing" },
              ]}
              display={(r) => ({ primary: r.name, secondary: r.slug })}
            />
          )}

          {section === "paginas" && (
            <SimpleCrud
              table="pages"
              title="Nova página"
              fields={[
                { key: "title", label: "Título", required: true },
                { key: "slug", label: "Slug (url)", required: true, placeholder: "sobre" },
                { key: "content", label: "Conteúdo", type: "textarea" },
                { key: "is_published", label: "Publicar agora", type: "checkbox" },
              ]}
              display={(r) => ({ primary: r.title, secondary: `/${r.slug}`, badge: r.is_published ? "Publicado" : "Rascunho" })}
            />
          )}

          {section === "empresas" && (
            <SimpleCrud
              table="companies"
              title="Nova empresa"
              fields={[
                { key: "name", label: "Nome", required: true },
                { key: "logo_url", label: "Logo (URL)", type: "url" },
                { key: "contact_email", label: "Email", type: "email" },
                { key: "website", label: "Website", type: "url" },
                { key: "is_active", label: "Ativa", type: "checkbox" },
              ]}
              display={(r) => ({ primary: r.name, secondary: r.contact_email || r.website || "—", badge: r.is_active ? "Ativa" : "Inativa" })}
            />
          )}

          {section === "modulos" && <ModulesAdmin />}
          {section === "aulas" && <LessonsAdmin />}
          {section === "usuarios" && <UsersAdmin />}
          {section === "comentarios" && <CommentsAdmin />}
          {section === "config" && <SettingsAdmin />}
          {section === "vendas" && <SalesAdmin />}
          {section === "pagamentos" && <PaymentGateways />}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
      <div className="bg-gradient-red w-10 h-10 rounded-lg flex items-center justify-center shadow-glow">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-display text-3xl">{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 focus:border-primary outline-none text-sm"
      />
    </div>
  );
}
