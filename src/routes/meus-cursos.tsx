import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { ShoppingCart, ChevronDown, Play } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/meus-cursos")({
  component: MeusCursos,
});

type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_url: string | null;
  lesson_count?: number;
};

function MeusCursos() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate({ to: "/login" }); return; }
    (async () => {
      const [{ data: cs }, { data: ens }, { data: ls }] = await Promise.all([
        supabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("enrollments").select("course_id").eq("user_id", session.user.id),
        supabase.from("lessons").select("course_id"),
      ]);
      const counts = new Map<string, number>();
      ls?.forEach((l: any) => counts.set(l.course_id, (counts.get(l.course_id) || 0) + 1));
      setCourses((cs || []).map((c: any) => ({ ...c, lesson_count: counts.get(c.id) || 0 })));
      setEnrollments(new Set((ens || []).map((e: any) => e.course_id)));
      setLoading(false);
    })();
  }, [authLoading, session, navigate]);

  const enroll = async (courseId: string) => {
    if (!session) return;
    const { error } = await supabase.from("enrollments").insert({ user_id: session.user.id, course_id: courseId });
    if (error) return toast.error(error.message);
    setEnrollments((s) => new Set([...s, courseId]));
    toast.success("Matrícula realizada!");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  const myCourses = courses.filter((c) => enrollments.has(c.id));
  const otherCourses = courses.filter((c) => !enrollments.has(c.id));

  // Group remaining courses by category
  const grouped = new Map<string, Course[]>();
  otherCourses.forEach((c) => {
    const key = c.category || "Sem Categoria";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div className="relative text-center px-6 max-w-3xl">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight">
            Meus <span className="text-primary text-glow">Cursos</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Acesse seus cursos adquiridos e explore novos conteúdos
          </p>
        </div>
        <a
          href="#conteudo"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary animate-bounce"
          aria-label="Rolar para conteúdo"
        >
          <ChevronDown className="w-7 h-7" />
        </a>
      </section>

      {/* Conteúdo */}
      <div id="conteudo" className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Continue assistindo (se houver) */}
        {myCourses.length > 0 ? (
          <CategorySection title="Continue assistindo" courses={myCourses} enrolled />
        ) : (
          <div className="bg-surface/60 border border-border rounded-xl py-10 px-6 text-center">
            <p className="text-foreground/90 font-medium">Você ainda não adquiriu nenhum curso.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore os produtos disponíveis abaixo e comece sua jornada de aprendizado!
            </p>
          </div>
        )}

        {/* Categorias */}
        {Array.from(grouped.entries()).map(([cat, list]) => (
          <CategorySection key={cat} title={cat} courses={list} onEnroll={enroll} />
        ))}
      </div>
    </div>
  );
}

function CategorySection({
  title, courses, enrolled, onEnroll,
}: { title: string; courses: Course[]; enrolled?: boolean; onEnroll?: (id: string) => void }) {
  if (!courses.length) return null;
  return (
    <section>
      <h2 className="font-display text-2xl md:text-3xl mb-5">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {courses.map((c) => (
          <div key={c.id} className="group relative">
            <Link
              to="/curso/$id"
              params={{ id: c.id }}
              className="block relative aspect-square rounded-xl overflow-hidden border border-border bg-surface group-hover:border-primary group-hover:shadow-glow transition-all"
            >
              <CourseCover title={c.title} coverUrl={c.cover_url} />
            </Link>
            {!enrolled && onEnroll && (
              <button
                onClick={() => onEnroll(c.id)}
                aria-label="Adquirir curso"
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-md transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
            {enrolled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary/90 text-primary-foreground rounded-full p-3 shadow-glow">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            )}
            <div className="mt-2 px-1">
              <div className="text-sm font-semibold line-clamp-2 leading-tight">{c.title}</div>
              {c.lesson_count !== undefined && (
                <div className="text-[11px] text-muted-foreground mt-0.5">{c.lesson_count} aulas</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CourseCover({ title, coverUrl }: { title: string; coverUrl: string | null }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-primary/30 via-red-950/60 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(255,0,55,0.28),transparent_32%)]" />
      <div className="absolute inset-0 flex items-end p-4">
        <div>
          <div className="mb-2 h-1 w-10 rounded-full bg-primary" />
          <div className="text-sm font-black leading-tight text-white line-clamp-3">{title}</div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">MarcondesFlix</div>
        </div>
      </div>
      {coverUrl && (
        <img
          src={coverUrl}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}
