import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { themeAtom } from "@/store"; // 引入我们之前定义的 atom

export function useThemeEffect() {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    const root = window.document.documentElement;

    // 1. 先移除所有相关类名
    root.classList.remove("light", "dark");

    // 2. 判断当前应用哪个主题
    if (theme === "system") {
      // 如果是跟随系统，检查系统当前偏好
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      // 否则直接应用 light 或 dark
      root.classList.add(theme);
    }
  }, [theme]); // 当 theme 变化时触发
}
