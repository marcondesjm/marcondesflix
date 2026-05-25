import { Instagram, Youtube, Linkedin, Twitter } from "lucide-react";

const cols = [
  {
    title: "Sobre o MarcondesFlix",
    links: ["Quem somos", "Como funciona", "Blog e novidades", "Seja um Criador"],
  },
  {
    title: "Seja um Criador",
    links: ["Painel do Criador", "Recursos e ferramentas", "Guia de monetização", "Comunidade", "Suporte para Criadores"],
  },
  {
    title: "Links importantes",
    links: ["cada", "Central de ajuda", "Política de mas", "tamanho e condições", "Perguntas frequentes", "me", "Resumo"],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface/40 border-t border-border/50 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-bold mb-4">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-bold mb-4">Redes Sociais</h4>
          <p className="text-sm text-muted-foreground mb-4">Siga-nos nas redes sociais e fique por dentro das novidades</p>
          <div className="flex gap-3">
            {[Instagram, Youtube, Linkedin, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-md bg-surface flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
