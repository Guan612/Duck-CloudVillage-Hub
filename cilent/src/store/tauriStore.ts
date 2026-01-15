import { atom } from "jotai";
import { LazyStore } from "@tauri-apps/plugin-store";

// ✅ 根据新文档，使用 LazyStore
// 它会在第一次被 access (get/set) 时自动加载，无需手动初始化
const store = new LazyStore("settings.json");

/**
 * 创建一个自动同步到 Tauri Store 的 Atom
 * @param key 文件存储的键名
 * @param initialValue 默认值 (当文件里没有这个key时使用)
 */
export function tauriStore<T>(key: string, initialValue: T) {
  // 1. 基础 atom，用于内存中快速读写
  const baseAtom = atom<T>(initialValue);

  // 2. 包装 atom：写入时同步到文件
  const persistentAtom = atom(
    (get) => get(baseAtom),
    async (get, set, update: T) => {
      // 立即更新前端 UI
      set(baseAtom, update);

      // 异步写入后端 Store
      await store.set(key, update);
      // 文档建议手动 save 以确保数据持久化 (虽然 load 有 autoSave 选项，但手动 save 更稳健)
      await store.save();
    },
  );

  // 3. 挂载时读取：组件首次渲染时，从文件拉取最新数据
  persistentAtom.onMount = (setAtom) => {
    // 这里的 init 是异步的
    const init = async () => {
      try {
        // LazyStore 会在这里自动 load 文件
        const savedValue = await store.get<T>(key);

        // 如果文件里有值，覆盖默认值
        if (savedValue !== null && savedValue !== undefined) {
          setAtom(savedValue);
        }
      } catch (error) {
        console.error(`Failed to load store key "${key}":`, error);
      }
    };

    init();
  };

  return persistentAtom;
}
