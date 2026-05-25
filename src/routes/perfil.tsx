import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, User as UserIcon, Camera, Save, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate({ to: "/login" }); return; }
    setCurrentEmail(session.user.email || "");
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (data) {
        const parts = (data.full_name || "").split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" "));
        setAvatarUrl(data.avatar_url);
      }
    })();
  }, [session, authLoading, navigate]);

  const saveProfile = async () => {
    if (!session) return;
    if (!firstName.trim()) return toast.error("Informe o primeiro nome");
    setSavingProfile(true);
    const { error } = await supabase.from("profiles")
      .update({ full_name: `${firstName.trim()} ${lastName.trim()}`.trim() })
      .eq("id", session.user.id);
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
  };

  const uploadAvatar = async (file: File) => {
    if (!session) return;
    const ext = file.name.split(".").pop();
    const path = `${session.user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) return toast.error(upErr.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", session.user.id);
    setAvatarUrl(url);
    toast.success("Foto atualizada!");
  };

  const changeEmail = async () => {
    if (!newEmail || newEmail !== confirmEmail) return toast.error("Os e-mails não coincidem");
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSavingEmail(false);
    if (error) return toast.error(error.message);
    toast.success("Confira seu novo e-mail para confirmar a alteração.");
    setNewEmail(""); setConfirmEmail("");
  };

  const changePassword = async () => {
    if (newPass.length < 6) return toast.error("Senha deve ter ao menos 6 caracteres");
    if (newPass !== confirmPass) return toast.error("As senhas não coincidem");
    setSavingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSavingPass(false);
    if (error) return toast.error(error.message);
    toast.success("Senha alterada!");
    setNewPass(""); setConfirmPass("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authed />
      <div className="pt-24 px-6 max-w-2xl mx-auto pb-24">
        <Link to="/meus-cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Meu Perfil
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-8">
          {/* Informações Pessoais */}
          <section>
            <h2 className="font-display text-xl flex items-center gap-2 mb-6">
              <UserIcon className="w-5 h-5 text-primary" /> Informações Pessoais
            </h2>

            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-24 h-24 rounded-full bg-surface-elevated border border-border overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-surface-elevated border border-border hover:border-primary/40 transition-colors">
                <Camera className="w-3.5 h-3.5" /> Alterar Foto
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Primeiro Nome *">
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Sobrenome *">
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="E-mail Atual" className="mt-4">
              <input value={currentEmail} disabled className={`${inputCls} opacity-60`} />
              <p className="text-xs text-muted-foreground mt-1">Para alterar o e-mail, use a seção "Alterar Email" abaixo.</p>
            </Field>

            <button onClick={saveProfile} disabled={savingProfile}
              className="mt-6 w-full bg-gradient-red text-primary-foreground py-3 rounded-md font-bold shadow-glow hover:scale-[1.01] transition-transform inline-flex items-center justify-center gap-2 disabled:opacity-60">
              <Save className="w-4 h-4" /> {savingProfile ? "Salvando..." : "Salvar Alterações"}
            </button>
          </section>

          <div className="border-t border-border" />

          {/* Alterar Email */}
          <section>
            <h2 className="font-display text-xl flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-blue-400" /> Alterar Email
            </h2>
            <Field label="Novo Email *">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com" className={inputCls} />
            </Field>
            <Field label="Confirmar Novo Email *" className="mt-4">
              <input type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="novo@email.com" className={inputCls} />
            </Field>
            <button onClick={changeEmail} disabled={savingEmail}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-md font-bold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              <Mail className="w-4 h-4" /> {savingEmail ? "Enviando..." : "Alterar Email"}
            </button>
          </section>

          <div className="border-t border-border" />

          {/* Segurança */}
          <section>
            <h2 className="font-display text-xl flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-amber-400" /> Segurança
            </h2>
            <Field label="Nova Senha *">
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputCls} />
              <p className="text-xs text-muted-foreground mt-1">Mínimo de 6 caracteres</p>
            </Field>
            <Field label="Confirmar Nova Senha *" className="mt-4">
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className={inputCls} />
            </Field>
            <button onClick={changePassword} disabled={savingPass}
              className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-md font-bold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              <Lock className="w-4 h-4" /> {savingPass ? "Salvando..." : "Alterar Senha"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}
