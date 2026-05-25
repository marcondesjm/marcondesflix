import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Check, Star, ThumbsUp, ThumbsDown, MessageCircle, Send, User as UserIcon } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

export const Route = createFileRoute("/curso/$id/modulo/$moduleId")({
  component: ModuloPage,
});

type Lesson = { id: string; title: string; description: string | null; video_url: string | null; position: number; duration_seconds: number | null };
type Module = { id: string; title: string };
type Course = { id: string; title: string };
type Comment = { id: string; user_id: string; content: string; created_at: string; profile?: { full_name: string | null; avatar_url: string | null } | null };

function ModuloPage() {
  const { id, moduleId } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [mod, setMod] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate({ to: "/login" }); return; }
    (async () => {
      const [{ data: c }, { data: m }, { data: ls }] = await Promise.all([
        supabase.from("courses").select("id,title").eq("id", id).maybeSingle(),
        supabase.from("modules").select("id,title").eq("id", moduleId).maybeSingle(),
        supabase.from("lessons").select("*").eq("module_id", moduleId).order("position"),
      ]);
      setCourse(c);
      setMod(m);
      setLessons(ls || []);
      setActiveId(ls?.[0]?.id ?? null);
      if (ls?.length) {
        const { data: pg } = await supabase
          .from("lesson_progress").select("lesson_id,completed")
          .eq("user_id", session.user.id)
          .in("lesson_id", ls.map((l: any) => l.id));
        const map: Record<string, boolean> = {};
        pg?.forEach((p: any) => { map[p.lesson_id] = p.completed; });
        setProgress(map);
      }
      setLoading(false);
    })();
  }, [id, moduleId, session, authLoading, navigate]);

  // Carrega comentários quando aula muda
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from("comments")
        .select("id,user_id,content,created_at")
        .eq("lesson_id", activeId)
        .order("created_at", { ascending: false });
      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const profiles = userIds.length
        ? (await supabase.from("profiles").select("id,full_name,avatar_url").in("id", userIds)).data || []
        : [];
      const profMap = new Map(profiles.map((p: any) => [p.id, p]));
      setComments((data || []).map((c) => ({ ...c, profile: profMap.get(c.user_id) ?? null })));
    })();
  }, [activeId]);

  const active = lessons.find((l) => l.id === activeId);
  const completedCount = lessons.filter((l) => progress[l.id]).length;

  const markComplete = async () => {
    if (!session || !active) return;
    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: session.user.id, lesson_id: active.id, completed: true, watched_seconds: active.duration_seconds || 0 },
      { onConflict: "user_id,lesson_id" }
    );
    if (error) return toast.error(error.message);
    setProgress((p) => ({ ...p, [active.id]: true }));
    toast.success("Aula concluída!");
  };

  const goPrev = () => {
    const idx = lessons.findIndex((l) => l.id === activeId);
    if (idx > 0) setActiveId(lessons[idx - 1].id);
  };
  const goNext = () => {
    const idx = lessons.findIndex((l) => l.id === activeId);
    if (idx < lessons.length - 1) setActiveId(lessons[idx + 1].id);
  };

  const submitComment = async () => {
    if (!session || !active || !newComment.trim()) return;
    const { error } = await supabase.from("comments").insert({
      user_id: session.user.id,
      lesson_id: active.id,
      content: newComment.trim(),
    });
    if (error) return toast.error(error.message);
    setNewComment("");
    toast.success("Comentário enviado! Aguarde aprovação.");
  };

  const fmtTime = (s: number | null) => {
    const sec = s || 0;
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!course || !mod) return <div className="min-h-screen bg-background flex items-center justify-center">Conteúdo não encontrado.</div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />

      <div className="pt-20 px-6 max-w-7xl mx-auto pb-24">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mt-4">
          <Link to="/meus-cursos" className="hover:text-primary">Cursos</Link>
          <span className="mx-2">/</span>
          <Link to="/curso/$id" params={{ id: course.id }} className="hover:text-primary">{course.title}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{mod.title}</span>
          {active && (<><span className="mx-2">/</span><span className="text-primary">{active.title}</span></>)}
        </div>

        {/* Top action bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to="/curso/$id" params={{ id: course.id }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-md bg-surface border border-border hover:border-primary/40 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Portal
          </Link>
          <div className="flex items-center gap-1 px-3 py-2 rounded-md bg-surface border border-border">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star className={`w-4 h-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <button
            onClick={markComplete}
            className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-md transition-colors ${
              active && progress[active.id] ? "bg-emerald-600 text-white" : "bg-surface border border-border hover:border-emerald-500/40"
            }`}
          >
            <Check className="w-4 h-4" /> {active && progress[active.id] ? "Concluída" : "Marcar Concluída"}
          </button>
          <button onClick={goPrev} className="text-sm font-semibold px-4 py-2 rounded-md bg-surface border border-border hover:border-primary/40 transition-colors">
            Aula Anterior
          </button>
          <button onClick={goNext} className="text-sm font-bold px-4 py-2 rounded-md bg-gradient-red text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform">
            Próxima Aula
          </button>
        </div>

        {/* Conteúdo */}
        <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-6">
          <div>
            <div className="aspect-video rounded-xl overflow-hidden bg-black border border-border">
              {active?.video_url ? (
                <VideoPlayer src={active.video_url} title={active.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Selecione uma aula</div>
              )}
            </div>

            {active && (
              <>
                <h1 className="font-display text-3xl md:text-4xl mt-6 text-primary">{active.title}</h1>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {active.description || "Sem descrição."}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <button className="p-2 rounded-md bg-surface border border-border hover:border-primary/40"><ThumbsUp className="w-4 h-4" /></button>
                  <button className="p-2 rounded-md bg-surface border border-border hover:border-primary/40"><ThumbsDown className="w-4 h-4" /></button>
                  <span className="text-sm text-muted-foreground inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {comments.length} comentários</span>
                </div>

                {/* Comentários */}
                <h2 className="font-display text-2xl mt-10 mb-4">Deixe abaixo seu comentário</h2>
                <div className="bg-surface border border-border rounded-xl p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-red flex items-center justify-center text-primary-foreground font-bold">
                    {(session?.user.email?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva seu comentário aqui..."
                      rows={3}
                      className="w-full bg-background border border-border rounded-md p-3 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={submitComment}
                        className="inline-flex items-center gap-2 bg-gradient-red text-primary-foreground px-5 py-2 rounded-md font-bold text-sm shadow-glow hover:scale-[1.02] transition-transform"
                      >
                        <Send className="w-4 h-4" /> Enviar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-surface border border-border rounded-lg p-4 flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-elevated overflow-hidden flex items-center justify-center shrink-0">
                        {c.profile?.avatar_url ? (
                          <img src={c.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{c.profile?.full_name || "Usuário"}</div>
                        <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</div>
                        <p className="text-sm mt-2 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground">Seja o primeiro a comentar.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="bg-surface border border-border rounded-xl p-4 h-fit lg:sticky lg:top-24">
            <h2 className="font-display text-lg mb-1">Conteúdo do Módulo</h2>
            <p className="text-xs text-muted-foreground mb-4">{completedCount} de {lessons.length} aulas concluídas</p>

            <ul className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {lessons.map((l, idx) => {
                const isActive = l.id === activeId;
                const isDone = progress[l.id];
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setActiveId(l.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left ${
                        isActive ? "bg-primary/10 border border-primary/40" : "hover:bg-surface-elevated border border-transparent"
                      }`}
                    >
                      {isDone ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{l.title}</div>
                        <div className="text-xs text-muted-foreground">{fmtTime(l.duration_seconds)}</div>
                      </div>
                      {isActive && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </button>
                  </li>
                );
              })}
              {lessons.length === 0 && <li className="text-sm text-muted-foreground p-3">Nenhuma aula neste módulo.</li>}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
