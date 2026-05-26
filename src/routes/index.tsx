import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check, X, Play, Sparkles, Shield, Zap, HeartHandshake, TrendingUp,
  Plus, Minus, Star,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const whyChoose = [
  { icon: Play, title: "Interface estilo Netflix que impressiona", desc: "Design premium que seus alunos amam desde o primeiro login. Navegação simples, visual moderno e experiência fluida que aumenta retenção e valor percebido." },
  { icon: Zap, title: "Tudo funciona sem travar na tecnologia", desc: "Você não perde tempo brigando com integrações, configurações ou erros técnicos. A estrutura nasce pronta para rodar do jeito certo." },
  { icon: Sparkles, title: "Estrutura completa: página, checkout e acesso", desc: "Landing page, pagamento e área de membros se comunicam perfeitamente, garantindo uma jornada de compra fluida do clique ao acesso." },
  { icon: Shield, title: "Economia real com as melhores taxas do mercado", desc: "Integração com gateways estratégicos que reduzem custos por venda, aumentam sua margem e fazem a plataforma praticamente se pagar." },
  { icon: HeartHandshake, title: "Suporte sem travas. Você nunca está sozinho", desc: "Quando algo trava, você não precisa 'se virar'. Nosso suporte entra, orienta, resolve e garante que o projeto vá ao ar." },
  { icon: TrendingUp, title: "Construído para lançar, vender e escalar", desc: "Não é só uma plataforma bonita. É uma estrutura feita para quem quer colocar a oferta no ar rápido, vender com confiança e escalar com autonomia." },
];

const painPoints = [
  "Interface feia e confusa",
  "Vídeos que ficam travando",
  "Marca da plataforma aparecendo mais que a sua",
  "Alunos reclamando da experiência",
  "Difícil de organizar conteúdo",
  "Falta de controle e personalização",
];

const solutions = [
  "Design Premium",
  "Tecnologia de Streaming",
  "Personalização Total",
  "Área Administrativa Completa",
  "Relatórios de Progresso",
  "Suporte 24h",
];

const completeFeatures = [
  "Player profissional com streaming adaptativo",
  "Plataforma completa para cursos e infoprodutos",
  "Área de membros totalmente personalizada com sua marca",
  "Checkout integrado com taxas e comissões reduzidas",
  "Relatórios claros de vendas e progressão de receita",
  "Automação total de pagamento, verificação e acesso do aluno",
  "Experiência otimizada para desktop e mobile",
  "Controle total dos seus cursos sem depender de terceiros",
  "Lançamento guiado com suporte técnico via WhatsApp",
  "Infraestrutura totalmente segura, confiável e escalável",
  "Escalável para crescer sem trocar de plataforma",
  "Integrações externas conforme necessidade do cliente",
];

const differentials = [
  "Design que parece Netflix, não 'curso online'",
  "Sem nossa marca (100% white label)",
  "Velocidade de carregamento surpreendente",
  "Suporte técnico humanizado",
  "Atualizações constantes sem custo extra",
  "Backup automático de todo o conteúdo",
  "SEO nativamente otimizado",
  "Sem limite de alunos ou vídeos",
];

const faqs = [
  { q: "Como funciona a hospedagem dos vídeos?", a: "Seus vídeos ficam hospedados em uma infraestrutura de streaming profissional, com player adaptativo que ajusta a qualidade conforme a conexão do aluno. Sem buffering, sem travamentos." },
  { q: "Preciso ter conhecimento técnico?", a: "Não. Nosso time configura tudo para você: domínio, checkout, integrações e área de membros. Você foca no conteúdo, a gente cuida da tecnologia." },
  { q: "Posso usar meu próprio domínio?", a: "Sim, a plataforma é 100% white label. Você usa seu domínio, sua marca, suas cores. Seus alunos nem percebem que existe uma plataforma por trás." },
  { q: "Quais formas de pagamento posso integrar?", a: "Integramos com os principais gateways do mercado, com taxas reduzidas. Aceita cartão, PIX, boleto e parcelamento." },
  { q: "Existe limite de alunos ou vídeos?", a: "O limite varia conforme o plano contratado. O plano Enterprise não tem limite prático e suporta operações de grande porte." },
  { q: "Como funciona o suporte?", a: "Suporte humanizado por WhatsApp e email. No plano Enterprise, suporte prioritário 24/7 com gerente de conta dedicado." },
  { q: "Posso migrar de outra plataforma?", a: "Sim, no plano Enterprise a migração é gratuita. Cuidamos de toda a transferência de conteúdo e alunos." },
  { q: "Quanto tempo leva para ficar pronto?", a: "Em média de 7 a 14 dias úteis após a aprovação do escopo, com lançamento acompanhado pelo nosso time." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem fidelidade. Você tem 14 dias de garantia para testar e, se não gostar, devolvemos seu investimento." },
  { q: "Vocês ajudam na configuração inicial?", a: "Sim, setup é gratuito e acompanhado pelo nosso time técnico, do início ao lançamento." },
];

const plans = [
  {
    name: "Start",
    sub: "Ideal para iniciantes",
    price: "1.497",
    installment: "ou 12x de R$ 157,90",
    popular: false,
    features: [
      "Até 200 alunos ativos",
      "Diagnóstico estratégico parcial",
      "Landing page profissional",
      "Checkout integrado",
      "Página de obrigado",
      "Hospedagem de vídeos incluída",
      "Configuração de pagamentos",
      "Pixel do Facebook e Meta Ads",
      "Integração Google Analytics",
      "Taxas de processamento reduzidas",
      "Suporte técnico via email e WhatsApp",
      "1 Admin + acesso à comunidade",
    ],
    cta: "COMEÇAR AGORA",
  },
  {
    name: "Premium",
    sub: "Para criadores em crescimento",
    price: "2.497",
    installment: "ou 12x de R$ 237,90",
    popular: true,
    features: [
      "Até 500 alunos ativos",
      "Tudo do plano Start",
      "Diagnóstico estratégico completo",
      "Consultoria profissional de copywriting",
      "Construção assistida do infoproduto",
      "Organização pedagógica de módulos",
      "Onboarding personalizado",
      "Upsell 1-clique configurado",
      "Área de membros VIP configurada",
      "3 Admins + relatórios avançados",
      "API para ferramentas externas",
      "Certificados personalizados",
      "Relatórios de funil de vendas",
    ],
    cta: "ESCOLHER PREMIUM",
  },
  {
    name: "Enterprise",
    sub: "Para grandes operações",
    price: "3.497",
    installment: "ou 12x de R$ 317,90",
    popular: false,
    features: [
      "Até 800 alunos ativos",
      "Tudo do plano Premium",
      "Roteiros prontos de VSL, Reels e Stories",
      "Acompanhamento completo até o lançamento",
      "Revisão técnica e estética final",
      "Migração de plataforma gratuita",
      "Personalização white-label total",
      "Desenvolvimento customizado",
      "Suporte prioritário 24/7",
      "10 Admins + Enterprise SSO",
      "SLA de 99,9% de uptime",
      "Gerente de conta dedicado",
    ],
    cta: "COMEÇAR AGORA",
  },
];

const guarantees = ["Garantia de 14 dias", "Sem contrato de fidelidade", "Setup gratuito"];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl bg-surface/40 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-surface/60 transition-colors"
      >
        <span className="font-semibold text-base md:text-lg">{q}</span>
        <span className="bg-primary/10 border border-primary/30 rounded-full p-1 shrink-0">
          {open ? <Minus className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
        </span>
      </button>
      {open && <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm">{a}</div>}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" width={1920} height={1088} />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="mb-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
            Plataforma completa para infoprodutos
          </div>
          <h1 className="font-display mx-auto max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.92] tracking-tight">
            Lance seu infoproduto
            <span className="block text-foreground/90">sem se prender na tecnologia</span>
            <span className="mt-2 block text-primary text-glow">mesmo comecando do zero</span>
          </h1>
          <p className="mt-7 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Tenha sua oferta pronta para vender com páginas, checkout, integrações, área de membros e suporte DWY.
            Economize em taxas e foque no que importa: seu conteúdo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#planos"
              className="bg-gradient-red text-primary-foreground px-7 py-3.5 rounded-md font-bold tracking-wide shadow-glow hover:scale-105 transition-transform text-xs md:text-sm"
            >
              QUERO MEU INFOPRODUTO SEM TRAVAS
            </a>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { n: "200+", l: "Criadores ativos" },
              { n: "150K+", l: "Alunos nas plataformas" },
              { n: "98%", l: "Satisfação" },
            ].map((s) => (
              <div key={s.l} className="bg-surface/60 backdrop-blur border border-border/60 rounded-lg p-6">
                <div className="font-display text-4xl text-primary text-glow">{s.n}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl">POR QUE ESCOLHER NOSSA PLATAFORMA</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A estrutura completa para lançar, vender e escalar sem se prender em tecnologia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((f) => (
              <div key={f.title} className="bg-surface border border-border rounded-xl p-8 hover:border-primary/50 hover:-translate-y-1 transition-all">
                <div className="bg-gradient-red w-12 h-12 rounded-lg flex items-center justify-center shadow-glow mb-5">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl mb-3 leading-snug">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {guarantees.map((g) => (
              <div key={g} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> {g}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl">SEUS ALUNOS MERECEM <span className="text-primary text-glow">MUITO MAIS</span></h2>
            <p className="mt-4 text-muted-foreground">Chega de plataformas que atrapalham a experiência do seu produto</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface border border-destructive/30 rounded-2xl p-8">
              <h3 className="font-display text-2xl mb-6">Cansado de plataformas amadoras que afastam seus alunos?</h3>
              <ul className="space-y-3">
                {painPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <span className="bg-destructive/15 border border-destructive/30 rounded-full p-1 mt-0.5 shrink-0"><X className="w-3 h-3 text-destructive" /></span>
                    <span className="text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface border border-primary/40 rounded-2xl p-8 shadow-glow">
              <h3 className="font-display text-2xl mb-6">Conheça o sistema MarcondesFlix para cursos que seus alunos vão amar</h3>
              <ul className="space-y-3">
                {solutions.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <span className="bg-emerald-500/15 border border-emerald-500/30 rounded-full p-1 mt-0.5 shrink-0"><Check className="w-3 h-3 text-emerald-400" /></span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center">
            <a href="#planos" className="bg-gradient-red text-primary-foreground px-8 py-4 rounded-md font-bold tracking-wide shadow-glow hover:scale-105 transition-transform inline-block text-sm md:text-base">
              QUERO MEU INFOPRODUTO SEM TRAVAS
            </a>
          </div>
        </div>
      </section>

      {/* COMPLETE PLATFORM */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl">UMA PLATAFORMA <span className="text-primary text-glow">COMPLETA</span></h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Para lançar seu infoproduto sem se prender na tecnologia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completeFeatures.map((f) => (
              <div key={f} className="flex items-start gap-3 bg-surface/40 border border-border rounded-lg p-5 hover:border-primary/40 transition-colors">
                <span className="bg-primary/15 border border-primary/30 rounded-full p-1 mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </span>
                <span className="text-sm leading-relaxed">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="#planos" className="bg-gradient-red text-primary-foreground px-8 py-4 rounded-md font-bold tracking-wide shadow-glow hover:scale-105 transition-transform inline-block text-sm md:text-base">
              QUERO MEU INFOPRODUTO SEM TRAVAS
            </a>
          </div>
        </div>
      </section>

      {/* DIFFERENTIALS */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl">SOMOS DIFERENTES <span className="text-primary text-glow">DAS OUTRAS</span></h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Plataforma criada para infoprodutores que querem uma experiência de streaming premium, alta performance e total liberdade de marca, sem limitações técnicas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {differentials.map((d) => (
              <div key={d} className="flex items-center gap-3 bg-surface/60 border border-border rounded-lg p-5 hover:border-primary/40 transition-colors">
                <Star className="w-5 h-5 text-primary fill-primary shrink-0" />
                <span className="text-sm font-medium">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-6xl">PERGUNTAS <span className="text-primary text-glow">FREQUENTES</span></h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="py-24 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl">PLANOS E <span className="text-primary text-glow">PREÇOS</span></h2>
            <p className="mt-4 text-muted-foreground">Escolha o plano ideal para escalar seu negócio de cursos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-8 border bg-surface/60 transition-all flex flex-col ${
                  p.popular
                    ? "border-primary/60 shadow-glow scale-[1.02] md:-translate-y-2"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-red text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-glow">
                    Mais Popular
                  </div>
                )}
                <div className="font-display text-3xl mb-1">{p.name}</div>
                <p className="text-sm text-muted-foreground mb-6">{p.sub}</p>
                <div className="mb-1">
                  <span className="text-xl font-display align-top">R$</span>
                  <span className="font-display text-5xl">{p.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">{p.installment}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-md font-bold tracking-wide transition-all ${
                    p.popular
                      ? "bg-gradient-red text-primary-foreground shadow-glow hover:scale-[1.02]"
                      : "border border-border bg-surface-elevated hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {guarantees.map((g) => (
              <div key={g} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> {g}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl">
            LANCE SEU <span className="text-primary text-glow">INFOPRODUTO PREMIUM</span> HOJE
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Vagas limitadas: apenas 15 novos projetos por mês.
          </p>
          <a
            href="https://wa.me/5548991893313"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex bg-gradient-red text-primary-foreground px-8 py-4 rounded-md font-bold tracking-wide shadow-glow hover:scale-105 transition-transform"
          >
            FALAR COM UM ESPECIALISTA
          </a>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {guarantees.map((g) => (
              <div key={g} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> {g}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-red rounded p-1"><Play className="w-3 h-3 fill-white text-white" /></div>
            <span className="font-display tracking-wider">Marcondes<span className="text-primary">Flix</span></span>
          </div>
          <Link to="/login" className="hover:text-primary transition-colors">Acesso Admin</Link>
          <div>© {new Date().getFullYear()} MarcondesFlix. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}

