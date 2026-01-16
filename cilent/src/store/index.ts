import { tauriStore } from "./tauriStore";

export const themeAtom = tauriStore<"light" | "dark" | "system">(
  "theme",
  "system",
);
