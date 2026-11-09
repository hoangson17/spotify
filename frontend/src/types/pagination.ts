export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

export const emptyPagination: PaginationMeta = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};
