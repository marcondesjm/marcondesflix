import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Layers, Play, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/curso/$id/")({
  component: CursoDetalhe,
});

type Course = { id: string; title: string; description: string | null; cover_url: string | null; category: string | null };
type Module = { id: string; title: string; position: number; course_id: string };
type Lesson = { id: string; module_id: string | null; course_id: string };

function CursoDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate({ to: "/login" }); return; }
    (async () => {
      const [{ data: c }, { data: m }, { data: l }, { data: e }] = await Promise.all([
        supabase.from("courses").select("*").eq("id", id).maybeSingle(),
        supabase.from("modules").select("*").eq("course_id", id).order("position"),
        supabase.from("lessons").select("id,module_id,course_id").eq("course_id", id),
        supabase.from("enrollments").select("id").eq("user_id", session.user.id).eq("course_id", id).maybeSingle(),
      ]);
      setCourse(c);
      setModules(m || []);
      setLessons(l || []);
      setEnrolled(!!e);
      setLoading(false);
    })();
  }, [id, session, authLoading, navigate]);

  const enroll = async () => {
    if (!session) return;
    const { error } = await supabase.from("enrollments").insert({ user_id: session.user.id, course_id: id });
    if (error) return toast.error(error.message);
    setEnrolled(true);
    toast.success("Matrícula realizada!");
  };

  const lessonsByModule = (mid: string) => lessons.filter((l) => l.module_id === mid).length;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!course) return <div className="min-h-screen bg-background flex items-center justify-center">Curso não encontrado.</div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-24">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <Link to="/meus-cursos" className="hover:text-primary">Cursos</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{course.title}</span>
        </div>

        {/* Hero */}
        <div className="grid md:grid-cols-[340px_1fr] gap-8 items-start">
          <div className="aspect-video rounded-xl overflow-hidden bg-surface-elevated border border-border">
            {course.cover_url ? (
              <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem capa</div>
            )}
          </div>
          <div>
            <div className="w-10 h-1 bg-primary rounded-full mb-4" />
            <h1 className="font-display text-5xl md:text-6xl">{course.title}</h1>
            {course.description && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-3xl">{course.description}</p>
            )}
            <div className="mt-5 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Layers className="w-4 h-4" /> {modules.length} módulos</span>
              <span className="inline-flex items-center gap-2"><Play className="w-4 h-4" /> {lessons.length} aulas</span>
            </div>
            {!enrolled && (
              <button onClick={enroll} className="mt-6 bg-gradient-red text-primary-foreground px-6 py-3 rounded-md font-bold shadow-glow hover:scale-[1.02] transition-transform">
                Matricular-se neste curso
              </button>
            )}
          </div>
        </div>

        {/* Módulos */}
        <h2 className="font-display text-3xl md:text-4xl mt-16 mb-6">Módulos do Curso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, idx) => {
            const count = lessonsByModule(m.id);
            return (
              <Link
                key={m.id}
                to="/curso/$id/modulo/$moduleId"
                params={{ id: course.id, moduleId: m.id }}
                className="group bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors flex flex-col"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-gradient-red flex items-center justify-center font-display text-2xl text-primary-foreground shadow-glow shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Módulo {idx + 1}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{count} {count === 1 ? "aula" : "aulas"}</div>
                  </div>
                </div>
                <h3 className="font-bold text-xl mt-5">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  Conteúdo deste módulo do curso {course.title}.
                </p>
                <div className="border-t border-border mt-5 pt-4 flex justify-end">
                  <span className="text-sm text-muted-foreground group-hover:text-primary inline-flex items-center gap-1 transition-colors">
                    Acessar módulo <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
          {modules.length === 0 && (
            <p className="text-muted-foreground col-span-full">Este curso ainda não possui módulos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
