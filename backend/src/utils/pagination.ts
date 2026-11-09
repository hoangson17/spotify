import { BadRequestException } from '@nestjs/common';

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

function positiveInteger(
  value: unknown,
  name: string,
  fallback: number,
): number {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestException(`${name} must be a positive integer`);
  }
  return parsed;
}

export function paginationOptions(
  pageValue?: unknown,
  limitValue?: unknown,
): PaginationOptions {
  const page = positiveInteger(pageValue, 'page', 1);
  const limit = positiveInteger(limitValue, 'limit', DEFAULT_PAGE_SIZE);
  if (limit > MAX_PAGE_SIZE) {
    throw new BadRequestException(`limit must not exceed ${MAX_PAGE_SIZE}`);
  }
  return { page, limit, skip: (page - 1) * limit };
}

export function paginated<T>(
  [items, total]: [T[], number],
  options: PaginationOptions,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / options.limit);
  return {
    items,
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
      hasPreviousPage: options.page > 1,
      hasNextPage: options.page < totalPages,
    },
  };
}
