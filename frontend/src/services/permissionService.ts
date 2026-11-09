import axios from "../axiosConfig";
import type { PaginatedResponse } from "@/types/pagination";

export type PermissionGroup = { key: string; label: string; actions: string[] };
export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  permissions: string[] | null;
  deletedAt?: string | null;
};
export const permissionService = {
  catalog: () => axios.get<PermissionGroup[]>("/user/permission-catalog"),
  admins: () =>
    axios.get<PaginatedResponse<AdminAccount>>("/user/admins", {
      params: { page: 1, limit: 100 },
    }),
  save: (id: string, permissions: string[]) =>
    axios.put<{ id: string; permissions: string[] }>(
      `/user/${id}/permissions`,
      { permissions }
    ),
};
