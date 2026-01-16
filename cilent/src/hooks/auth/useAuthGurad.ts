import { tauriLocalStore } from "@/store/tauriStore";
import { redirect } from "@tanstack/react-router";

export async function requireAuth(locationHref: string) {
  // 注意：这里必须读 tauri的store
  const token = await tauriLocalStore.get("token");

  if (!token || token === "null" || token === '""') {
    throw redirect({
      to: "/auth/login",
      search: {
        redirect: locationHref,
      },
    });
  }
}
