import { atom } from "jotai";
import { tauriStore } from "./tauriStore";
import { UserInfo } from "@/types/api-responses";

export const tokenAtom = tauriStore<string | null>("token", null);
export const refreshTokenAtom = tauriStore<string | null>("refreshToken", null);
// 一个派生 atom，用来方便地判断是否登录
export const isAuthenticatedAtom = atom((get) => !!get(tokenAtom));

//用户信息atom
export const userInfoAtom = tauriStore<UserInfo | null>("userInfo", null);
