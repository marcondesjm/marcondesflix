import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Course = { id: string; title: string };
type Module = { id: string; title: string; position: number; course_id: string };
type AdminPickerProps = { initialCourseId?: string };

export function ModulesAdmin({ initialCourseId }: AdminPickerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("courses").select("id,title").order("title");
      setCourses(data || []);
      if (initialCourseId && data?.some((course) => course.id === initialCourseId)) {
        setCourseId(initialCourseId);
      } else if (data?.[0]) {
        setCourseId(data[0].id);
      }
    })();
  }, [initialCourseId]);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      const { data } = await supabase.from("modules").select("*").eq("course_id", courseId).order("position");
      setModules(data || []);
      setEditingId(null);
    })();
  }, [courseId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title.trim()) return;
    const { data, error } = await supabase
      .from("modules")
      .insert({ course_id: courseId, title: title.trim(), position: modules.length })
      .select().single();
    if (error) return toast.error(error.message);
    setModules((m) => [...m, data as Module]);
    setTitle("");
    toast.success("Modulo criado!");
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir modulo? Aulas vinculadas ficarao sem modulo.")) return;
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setModules((m) => m.filter((x) => x.id !== id));
  };

  const startEdit = (module: Module) => {
    setEditingId(module.id);
    setEditTitle(module.title);
  };

  const save = async (id: string) => {
    if (!editTitle.trim()) return toast.error("Informe o nome do modulo.");
    const { error } = await supabase.from("modules").update({ title: editTitle.trim() }).eq("id", id);
    if (error) return toast.error(error.message);
    setModules((mods) => mods.map((module) => (module.id === id ? { ...module, title: editTitle.trim() } : module)));
    setEditingId(null);
    toast.success("Modulo atualizado!");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Curso</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full max-w-md mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm"
        >
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <form onSubmit={create} className="flex gap-2 max-w-2xl">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do modulo"
          required
          className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
        />
        <button className="bg-gradient-red px-4 rounded-md font-bold text-sm shadow-glow inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {modules.map((m, i) => (
          <div key={m.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
            <span className="text-muted-foreground text-xs font-mono w-6">{i + 1}.</span>
            {editingId === m.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                />
                <button onClick={() => save(m.id)} className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground font-semibold inline-flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Salvar
                </button>
                <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:text-primary">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 font-semibold">{m.title}</div>
                <button onClick={() => startEdit(m)} className="p-2 text-muted-foreground hover:text-primary" title="Editar modulo">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(m.id)} className="p-2 text-muted-foreground hover:text-primary" title="Excluir modulo">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
        {!modules.length && <div className="text-muted-foreground text-sm py-8 text-center">Nenhum modulo neste curso.</div>}
      </div>
    </div>
  );
}

type Lesson = {
  id: string;
  title: string;
  course_id: string;
  module_id: string | null;
  position: number;
  video_url: string | null;
  duration_seconds: number | null;
};

export function LessonsAdmin({ initialCourseId }: AdminPickerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState({ title: "", video_url: "", duration_seconds: "", module_id: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", video_url: "", duration_seconds: "", module_id: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("courses").select("id,title").order("title");
      setCourses(data || []);
      if (initialCourseId && data?.some((course) => course.id === initialCourseId)) {
        setCourseId(initialCourseId);
      } else if (data?.[0]) {
        setCourseId(data[0].id);
      }
    })();
  }, [initialCourseId]);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      const [{ data: ls }, { data: mods }] = await Promise.all([
        supabase.from("lessons").select("*").eq("course_id", courseId).order("position"),
        supabase.from("modules").select("*").eq("course_id", courseId).order("position"),
      ]);
      setLessons(ls || []);
      setModules(mods || []);
      setEditingId(null);
    })();
  }, [courseId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: form.title,
        video_url: form.video_url || null,
        duration_seconds: parseInt(form.duration_seconds) || 0,
        module_id: form.module_id || null,
        position: lessons.length,
      })
      .select().single();
    if (error) return toast.error(error.message);
    setLessons((l) => [...l, data as Lesson]);
    setForm({ title: "", video_url: "", duration_seconds: "", module_id: "" });
    toast.success("Aula criada!");
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir aula?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setLessons((l) => l.filter((x) => x.id !== id));
  };

  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setEditForm({
      title: lesson.title,
      video_url: lesson.video_url || "",
      duration_seconds: lesson.duration_seconds ? String(lesson.duration_seconds) : "",
      module_id: lesson.module_id || "",
    });
  };

  const save = async (id: string) => {
    if (!editForm.title.trim()) return toast.error("Informe o titulo da aula.");
    const payload = {
      title: editForm.title.trim(),
      video_url: editForm.video_url || null,
      duration_seconds: parseInt(editForm.duration_seconds) || 0,
      module_id: editForm.module_id || null,
    };
    const { error } = await supabase.from("lessons").update(payload).eq("id", id);
    if (error) return toast.error(error.message);
    setLessons((items) => items.map((lesson) => (lesson.id === id ? { ...lesson, ...payload } : lesson)));
    setEditingId(null);
    toast.success("Aula atualizada!");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Curso</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full max-w-md mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm"
        >
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <form onSubmit={create} className="grid md:grid-cols-[1fr_1fr_130px_auto] gap-2 max-w-5xl">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Titulo da aula" required
          className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
        />
        <input
          value={form.video_url}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          placeholder="URL do video (YouTube, Vimeo, MP4)"
          className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
        />
        <input
          value={form.duration_seconds}
          onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })}
          placeholder="Segundos"
          type="number"
          className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
        />
        <button className="bg-gradient-red px-4 py-2 rounded-md font-bold text-sm shadow-glow inline-flex items-center gap-2 justify-center">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
        <select
          value={form.module_id}
          onChange={(e) => setForm({ ...form, module_id: e.target.value })}
          className="md:col-span-3 bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
        >
          <option value="">Sem modulo</option>
          {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
        </select>
      </form>

      <div className="space-y-2">
        {lessons.map((l, i) => (
          <div key={l.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
            <span className="text-muted-foreground text-xs font-mono w-6">{i + 1}.</span>
            {editingId === l.id ? (
              <div className="flex-1 grid md:grid-cols-[1fr_1fr_120px_auto_auto] gap-2">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                />
                <input
                  value={editForm.video_url}
                  onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                  className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                  placeholder="URL do video"
                />
                <input
                  value={editForm.duration_seconds}
                  onChange={(e) => setEditForm({ ...editForm, duration_seconds: e.target.value })}
                  type="number"
                  className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                  placeholder="Segundos"
                />
                <select
                  value={editForm.module_id}
                  onChange={(e) => setEditForm({ ...editForm, module_id: e.target.value })}
                  className="md:col-span-3 bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option value="">Sem modulo</option>
                  {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
                </select>
                <button onClick={() => save(l.id)} className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Salvar
                </button>
                <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{l.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.video_url || "Sem video"}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {modules.find((module) => module.id === l.module_id)?.title || "Sem modulo"} - {Math.round((l.duration_seconds || 0) / 60)} min
                  </div>
                </div>
                <button onClick={() => startEdit(l)} className="p-2 text-muted-foreground hover:text-primary" title="Editar aula">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(l.id)} className="p-2 text-muted-foreground hover:text-primary" title="Excluir aula">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
        {!lessons.length && <div className="text-muted-foreground text-sm py-8 text-center">Nenhuma aula neste curso.</div>}
      </div>
    </div>
  );
}
type UserRow = { id: string; full_name: string | null; created_at: string; isAdmin: boolean };

export function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: profs }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const adminSet = new Set((roles || []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
      setUsers((profs || []).map((p: any) => ({ ...p, isAdmin: adminSet.has(p.id) })));
      setLoading(false);
    })();
  }, []);

  const toggleAdmin = async (u: UserRow) => {
    if (u.isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin removido");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Promovido a admin");
    }
    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, isAdmin: !u.isAdmin } : x)));
  };

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-red flex items-center justify-center font-bold text-sm shadow-glow">
            {(u.full_name || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{u.full_name || "Sem nome"}</div>
            <div className="text-xs text-muted-foreground truncate">{u.id}</div>
          </div>
          <button
            onClick={() => toggleAdmin(u)}
            className={`text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wider ${
              u.isAdmin ? "bg-primary text-primary-foreground" : "bg-surface-elevated text-muted-foreground hover:text-primary"
            }`}
          >
            {u.isAdmin ? "Admin" : "Promover"}
          </button>
        </div>
      ))}
      {!users.length && <div className="text-muted-foreground text-sm py-8 text-center">Nenhum usuÃ¡rio.</div>}
    </div>
  );
}

type Comment = { id: string; content: string; lesson_id: string; user_id: string; is_approved: boolean; created_at: string };

export function CommentsAdmin() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("comments").select("*").order("created_at", { ascending: false });
      setComments(data || []);
      setLoading(false);
    })();
  }, []);

  const approve = async (c: Comment) => {
    const { error } = await supabase.from("comments").update({ is_approved: !c.is_approved }).eq("id", c.id);
    if (error) return toast.error(error.message);
    setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, is_approved: !c.is_approved } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir comentÃ¡rio?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setComments((cs) => cs.filter((x) => x.id !== id));
  };

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;
  if (!comments.length) return <div className="text-muted-foreground text-sm py-8 text-center">Nenhum comentÃ¡rio ainda.</div>;

  return (
    <div className="space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm">{c.content}</p>
              <div className="text-xs text-muted-foreground mt-2">
                Aula: <code>{c.lesson_id.slice(0, 8)}</code> Â· {new Date(c.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
            <button
              onClick={() => approve(c)}
              className={`text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wider whitespace-nowrap ${
                c.is_approved ? "bg-primary/15 text-primary" : "bg-surface-elevated text-muted-foreground hover:text-primary"
              }`}
            >
              {c.is_approved ? "Aprovado" : "Aprovar"}
            </button>
            <button onClick={() => remove(c.id)} className="p-2 text-muted-foreground hover:text-primary">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const SETTINGS_KEYS: { key: string; label: string; placeholder: string }[] = [
  { key: "site_name", label: "Nome do site", placeholder: "MarcondesFlix" },
  { key: "site_tagline", label: "Slogan", placeholder: "Cursos sob demanda" },
  { key: "support_email", label: "Email de suporte", placeholder: "suporte@exemplo.com" },
  { key: "primary_color", label: "Cor primÃ¡ria (hex)", placeholder: "#E50914" },
];

export function SettingsAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("*");
      const v: Record<string, string> = {};
      (data || []).forEach((r: any) => { v[r.key] = typeof r.value === "string" ? r.value : JSON.stringify(r.value); });
      setValues(v);
      setLoading(false);
    })();
  }, []);

  const save = async (key: string) => {
    const value = values[key] ?? "";
    const { error } = await supabase.from("settings").upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" });
    if (error) return toast.error(error.message);
    toast.success("Salvo");
  };

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {SETTINGS_KEYS.map((s) => (
        <div key={s.key} className="bg-surface border border-border rounded-xl p-4">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</label>
          <div className="flex gap-2 mt-1">
            <input
              value={values[s.key] ?? ""}
              onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
              placeholder={s.placeholder}
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
            />
            <button onClick={() => save(s.key)} className="bg-gradient-red px-4 rounded-md font-bold text-sm shadow-glow">
              Salvar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type Sale = { id: string; user_id: string; course_id: string | null; amount: number; status: string; created_at: string };

export function SalesAdmin() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
      setSales(data || []);
      setLoading(false);
    })();
  }, []);

  const total = sales.filter((s) => s.status === "paid").reduce((sum, s) => sum + Number(s.amount), 0);

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Receita total (pagas)</div>
        <div className="font-display text-4xl text-primary text-glow mt-1">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{sales.length} transaÃ§Ãµes</div>
      </div>

      {!sales.length ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Nenhuma venda registrada.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Aluno</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3">{new Date(s.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                      s.status === "paid" ? "bg-primary/15 text-primary" : "bg-surface-elevated text-muted-foreground"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    R$ {Number(s.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

