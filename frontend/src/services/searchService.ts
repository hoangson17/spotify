import axiosInstance from "../axiosConfig";
import type { PaginationParams } from "@/types/pagination";

export const searchService = {
  search(query: string, params: PaginationParams = {}) {
    return axiosInstance.get("/search", {
      params: { q: query, ...params },
    });
  },
};
