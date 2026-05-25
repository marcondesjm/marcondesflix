import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";

export const Route = createFileRoute("/admin/curso/$id")({
  component: AdminCourseEdit,
});

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  position: number;
  duration_seconds: number | null;
};

function AdminCourseEdit() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState({ title: "", description: "", video_url: "", duration_seconds: "0" });

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ data: c }, { data: ls }] = await Promise.all([
        supabase.from("courses").select("*").eq("id", id).maybeSingle(),
        supabase.from("lessons").select("*").eq("course_id", id).order("position"),
      ]);
      setCourse(c);
      setLessons(ls || []);
    })();
  }, [isAdmin, id]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-background flex items-center justify-center">Acesso negado.</div>;

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextPos = lessons.length ? Math.max(...lessons.map((l) => l.position)) + 1 : 1;
    const { error, data } = await supabase
      .from("lessons")
      .insert({
        course_id: id,
        title: form.title,
        description: form.description || null,
        video_url: form.video_url || null,
        duration_seconds: parseInt(form.duration_seconds) || 0,
        position: nextPos,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setLessons((l) => [...l, data as Lesson]);
    setForm({ title: "", description: "", video_url: "", duration_seconds: "0" });
    toast.success("Aula adicionada");
  };

  const deleteLesson = async (lid: string) => {
    if (!confirm("Excluir esta aula?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", lid);
    if (error) return toast.error(error.message);
    setLessons((l) => l.filter((x) => x.id !== lid));
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />
      <div className="pt-24 px-6 max-w-6xl mx-auto pb-24">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar ao painel
        </Link>

        <h1 className="font-display text-4xl">{course?.title?.toUpperCase()}</h1>
        <p className="text-muted-foreground mt-1">{course?.description}</p>

        <div className="grid lg:grid-cols-[400px_1fr] gap-8 mt-10">
          <form onSubmit={addLesson} className="bg-surface border border-border rounded-xl p-6 h-fit">
            <h2 className="font-display text-2xl mb-4">NOVA AULA</h2>
            <div className="space-y-3">
              <Field label="Título" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="URL do vídeo (mp4 / YouTube)" value={form.video_url} onChange={(v) => setForm({ ...form, video_url: v })} placeholder="https://..." />
              <Field label="Duração (segundos)" type="number" value={form.duration_seconds} onChange={(v) => setForm({ ...form, duration_seconds: v })} />
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</label>
                <textarea
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 focus:border-primary outline-none text-sm"
                />
              </div>
              <button type="submit" className="w-full bg-gradient-red py-3 rounded-md font-bold shadow-glow inline-flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar aula
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h2 className="font-display text-2xl">AULAS</h2>
            {lessons.map((l, i) => (
              <div key={l.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="font-display text-2xl text-primary w-8 text-center">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{l.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.video_url || "Sem vídeo"}</div>
                </div>
                <span className="text-xs text-muted-foreground">{Math.round((l.duration_seconds || 0) / 60)} min</span>
                <button onClick={() => deleteLesson(l.id)} className="p-2 text-muted-foreground hover:text-primary">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!lessons.length && <div className="text-sm text-muted-foreground py-8 text-center">Nenhuma aula. Adicione a primeira ao lado.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
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
