import { createFileRoute } from "@tanstack/react-router";
import { SueDesk } from "@/components/sue-desk";

export const Route = createFileRoute("/")({
  component: SueDesk,
});
