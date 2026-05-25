import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-primary text-glow">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta página não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex bg-gradient-red text-primary-foreground px-5 py-2 rounded-md font-bold shadow-glow"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 bg-gradient-red text-primary-foreground px-5 py-2 rounded-md font-bold shadow-glow"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MarcondesFlix — Plataforma de cursos para criadores" },
      { name: "description", content: "Lance seu infoproduto sem se prender em tecnologia. Páginas, checkout, área de membros e suporte DWY." },
      { property: "og:title", content: "MarcondesFlix — Plataforma de cursos para criadores" },
      { name: "twitter:title", content: "MarcondesFlix — Plataforma de cursos para criadores" },
      { property: "og:description", content: "Lance seu infoproduto sem se prender em tecnologia. Páginas, checkout, área de membros e suporte DWY." },
      { name: "twitter:description", content: "Lance seu infoproduto sem se prender em tecnologia. Páginas, checkout, área de membros e suporte DWY." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/87b1bfc4-9451-4713-a32c-1ad6bf7c6276/id-preview-85eb3e90--6d6080ac-9658-4ca6-8da8-4a1d14f7a6bc.lovable.app-1778258014091.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/87b1bfc4-9451-4713-a32c-1ad6bf7c6276/id-preview-85eb3e90--6d6080ac-9658-4ca6-8da8-4a1d14f7a6bc.lovable.app-1778258014091.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
}
