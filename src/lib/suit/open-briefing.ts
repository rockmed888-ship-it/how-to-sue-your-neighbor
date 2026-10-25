import { createServerFn } from "@tanstack/react-start";
import type { BriefingResponse } from "@/lib/suit/types";

export const openBriefing = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const row = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    return {
      story: typeof row.story === "string" ? row.story : "",
      state: typeof row.state === "string" ? row.state : "",
      place: typeof row.place === "string" ? row.place : "",
    };
  })
  .handler(async ({ data }): Promise<BriefingResponse> => {
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const { buildBriefing } = await import("@/lib/suit/briefing.server");
    const ip = getRequestIP({ xForwardedFor: true }) ?? "local";
    return buildBriefing(data, ip);
  });
