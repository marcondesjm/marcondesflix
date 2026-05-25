import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Save } from "lucide-react";

type Field = { key: string; label: string; type?: "text" | "password" };
type Gateway = {
  id: string;
  name: string;
  color: string; // tailwind bg color class
  fields: Field[];
};

const GATEWAYS: Gateway[] = [
  {
    id: "stripe",
    name: "Stripe",
    color: "bg-violet-600",
    fields: [
      { key: "publishable_key", label: "Publishable Key" },
      { key: "secret_key", label: "Secret Key", type: "password" },
      { key: "webhook_secret", label: "Webhook Secret", type: "password" },
    ],
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    color: "bg-sky-500",
    fields: [
      { key: "public_key", label: "Public Key" },
      { key: "access_token", label: "Access Token", type: "password" },
      { key: "webhook_secret", label: "Webhook Secret", type: "password" },
    ],
  },
  {
    id: "pagseguro",
    name: "PagSeguro PIX",
    color: "bg-emerald-600",
    fields: [
      { key: "email", label: "Email" },
      { key: "token", label: "Token", type: "password" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    color: "bg-blue-600",
    fields: [
      { key: "client_id", label: "Client ID" },
      { key: "client_secret", label: "Client Secret", type: "password" },
      { key: "webhook_id", label: "Webhook ID" },
    ],
  },
  {
    id: "asaas",
    name: "Asaas",
    color: "bg-cyan-600",
    fields: [
      { key: "api_key", label: "API Key", type: "password" },
      { key: "webhook_secret", label: "Webhook Secret", type: "password" },
    ],
  },
];

type GatewayState = {
  active: boolean;
  env: "sandbox" | "production";
  values: Record<string, string>;
};

const SETTINGS_KEY = "payment_gateways";

export function PaymentGateways() {
  const [primary, setPrimary] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, GatewayState>>(() =>
    Object.fromEntries(GATEWAYS.map((g) => [g.id, { active: false, env: "sandbox", values: {} }]))
  );
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: row } = await supabase.from("settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
      if (row?.value) {
        const v = row.value as any;
        setPrimary(v.primary ?? null);
        setData((d) => ({ ...d, ...(v.gateways || {}) }));
      }
      setLoading(false);
    })();
  }, []);

  const persist = async (next: { primary: string | null; gateways: Record<string, GatewayState> }) => {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: SETTINGS_KEY, value: next as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) toast.error(error.message);
  };

  const setPrimaryGateway = async (id: string) => {
    setPrimary(id);
    const next = { ...data };
    next[id] = { ...next[id], active: true };
    setData(next);
    await persist({ primary: id, gateways: next });
    toast.success(`${GATEWAYS.find((g) => g.id === id)?.name} definido como principal`);
  };

  const updateField = (id: string, key: string, value: string) => {
    setData((d) => ({ ...d, [id]: { ...d[id], values: { ...d[id].values, [key]: value } } }));
  };

  const setEnv = (id: string, env: "sandbox" | "production") => {
    setData((d) => ({ ...d, [id]: { ...d[id], env } }));
  };

  const saveGateway = async (id: string) => {
    setSavingId(id);
    await persist({ primary, gateways: data });
    setSavingId(null);
    toast.success("Configurações salvas");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200">
        Configure os gateways de pagamento. Apenas <strong>UM</strong> gateway pode estar ativo como principal por vez.
        As chaves ficam armazenadas com acesso restrito a administradores.
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {GATEWAYS.map((g) => {
          const state = data[g.id];
          const isPrimary = primary === g.id;
          return (
            <div
              key={g.id}
              className={`bg-surface border rounded-xl p-5 transition-colors ${
                isPrimary ? "border-primary shadow-glow" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${g.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-display text-lg leading-none">{g.name}</div>
                    <span
                      className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${
                        state.active ? "bg-emerald-500/20 text-emerald-400" : "bg-surface-elevated text-muted-foreground"
                      }`}
                    >
                      {state.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPrimaryGateway(g.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 ${
                      isPrimary ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  />
                  Principal
                </button>
              </div>

              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Ambiente:</div>
                <div className="inline-flex bg-surface-elevated rounded-md p-1 gap-1">
                  {(["sandbox", "production"] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setEnv(g.id, env)}
                      className={`text-xs px-3 py-1 rounded font-semibold capitalize ${
                        state.env === env
                          ? env === "production"
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {env === "production" ? "Produção" : "Sandbox"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {g.fields.map((f) => (
                  <div key={f.key}>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</label>
                    <input
                      type={f.type === "password" ? "password" : "text"}
                      value={state.values[f.key] || ""}
                      onChange={(e) => updateField(g.id, f.key, e.target.value)}
                      className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none font-mono"
                    />
                  </div>
                ))}
                <button
                  onClick={() => saveGateway(g.id)}
                  disabled={savingId === g.id}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-surface-elevated border border-border hover:border-primary py-2.5 rounded-md text-sm font-semibold transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {savingId === g.id ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
