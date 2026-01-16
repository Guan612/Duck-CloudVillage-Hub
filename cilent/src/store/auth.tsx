import { atom } from "jotai";
import { tauriStore } from "./tauriStore";

export const tokenAtom = tauriStore<string | null>("token", null);
// 一个派生 atom，用来方便地判断是否登录
export const isAuthenticatedAtom = atom((get) => !!get(tokenAtom));

//用户信息atom
export const userInfoAtom = tauriStore("userInfo", null);
