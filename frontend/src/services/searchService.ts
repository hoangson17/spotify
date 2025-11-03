import axiosInstance from "../axiosConfig";

export const searchService = {
  search(query: string) {
    return axiosInstance.get("/search", {
      params: { q: query },
    });
  },
};
