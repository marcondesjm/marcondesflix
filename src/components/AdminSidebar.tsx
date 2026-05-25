import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Building2, ShoppingCart, FolderTree,
  BookOpen, Layers, PlayCircle, Users, Settings, MessageSquare, X, ChevronRight, CreditCard,
} from "lucide-react";

export type AdminSection =
  | "dashboard" | "paginas" | "empresas" | "vendas" | "categorias"
  | "cursos" | "modulos" | "aulas" | "usuarios" | "config" | "comentarios" | "pagamentos";

const items: { id: AdminSection; label: string; icon: any; hasChildren?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "paginas", label: "Gerenciar Páginas", icon: FileText },
  { id: "empresas", label: "Gerenciar Empresas", icon: Building2 },
  { id: "vendas", label: "Gestão de Vendas", icon: ShoppingCart, hasChildren: true },
  { id: "categorias", label: "Gerenciar Categorias", icon: FolderTree },
  { id: "cursos", label: "Gerenciar Cursos", icon: BookOpen },
  { id: "modulos", label: "Gerenciar Módulos", icon: Layers },
  { id: "aulas", label: "Gerenciar Aulas", icon: PlayCircle },
  { id: "usuarios", label: "Gerenciar Usuários", icon: Users },
  { id: "pagamentos", label: "Gateways de Pagamento", icon: CreditCard },
  { id: "config", label: "Configurações", icon: Settings, hasChildren: true },
  { id: "comentarios", label: "Moderar Comentários", icon: MessageSquare },
];

export function AdminSidebar({
  active, open, onClose,
}: { active: AdminSection; open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur z-40"
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-surface border-r border-border flex-shrink-0 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-lg tracking-wider">ADMINISTRAÇÃO</h2>
          <button onClick={onClose} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2 overflow-y-auto h-[calc(100vh-65px)]">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = it.id === active;
            return (
              <Link
                key={it.id}
                to="/admin"
                search={{ s: it.id }}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/80 hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{it.label}</span>
                {it.hasChildren && <ChevronRight className="w-4 h-4 opacity-60" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
