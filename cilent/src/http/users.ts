import { User } from "@/types/api-responses";
import { http } from ".";

// 获取用户列表（需要管理员权限）
export const getUsersApi = () => {
  return http.get<User[]>("/user");
};

// 获取指定用户信息
export const getUserApi = (id: number) => {
  return http.get<User>(`/user/${id}`);
};

// 更新个人资料/密码
export const updateProfileApi = (data: {
  nickname?: string;
  avatarUrl?: string;
  newPassword?: string;
  oldPassword?: string;
  confirmPassword?: string;
}) => {
  return http.patch<User>("/user", data);
};
