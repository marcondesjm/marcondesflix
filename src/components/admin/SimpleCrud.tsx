import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "email" | "url" | "number" | "checkbox";
  placeholder?: string;
  required?: boolean;
};

export function SimpleCrud({
  table,
  fields,
  title,
  display,
  orderBy = "created_at",
  ascending = false,
}: {
  table: "categories" | "pages" | "companies" | "sales";
  fields: Field[];
  title: string;
  display: (row: any) => { primary: string; secondary?: string; badge?: string };
  orderBy?: string;
  ascending?: boolean;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from(table).select("*").order(orderBy, { ascending });
      setRows(data || []);
      setLoading(false);
    })();
  }, [table, orderBy, ascending]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {};
    for (const f of fields) {
      payload[f.key] = form[f.key] ?? (f.type === "checkbox" ? false : f.type === "number" ? 0 : "");
    }
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) return toast.error(error.message);
    setRows((r) => [data, ...r]);
    setForm({});
    toast.success("Criado!");
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Excluído");
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <form onSubmit={create} className="bg-surface border border-border rounded-xl p-6 h-fit space-y-3">
        <h2 className="font-display text-xl mb-2">{title}</h2>
        {fields.map((f) => (
          <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} />
        ))}
        <button type="submit" className="w-full bg-gradient-red py-2.5 rounded-md font-bold shadow-glow inline-flex items-center justify-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {loading && <div className="text-muted-foreground text-sm">Carregando...</div>}
        {!loading && !rows.length && <div className="text-muted-foreground text-sm py-8 text-center">Nenhum item ainda.</div>}
        {rows.map((row) => {
          const d = display(row);
          return (
            <div key={row.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{d.primary}</div>
                {d.secondary && <div className="text-xs text-muted-foreground truncate">{d.secondary}</div>}
              </div>
              {d.badge && (
                <span className="text-xs px-2 py-1 rounded font-bold uppercase tracking-wider bg-primary/15 text-primary">
                  {d.badge}
                </span>
              )}
              <button onClick={() => remove(row.id)} className="p-2 text-muted-foreground hover:text-primary">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  if (field.type === "textarea") {
    return (
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">{field.label}</label>
        <textarea
          required={field.required}
          rows={4}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 focus:border-primary outline-none text-sm"
        />
      </div>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        {field.label}
      </label>
    );
  }
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{field.label}</label>
      <input
        type={field.type || "text"}
        required={field.required}
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 focus:border-primary outline-none text-sm"
      />
    </div>
  );
}
