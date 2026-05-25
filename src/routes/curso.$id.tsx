import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/curso/$id")({
  component: () => <Outlet />,
});
