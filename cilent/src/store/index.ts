import { tauriStore } from "./tauriStore";

export const tokenAtom = tauriStore<string | null>("token", null);

export const themeAtom = tauriStore<"light" | "dark" | "system">(
  "theme",
  "system",
);
