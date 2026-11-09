import { BadRequestException } from '@nestjs/common';
import { paginated, paginationOptions } from './pagination';

describe('pagination', () => {
  it('uses safe defaults and calculates the database offset', () => {
    expect(paginationOptions()).toEqual({ page: 1, limit: 12, skip: 0 });
    expect(paginationOptions('3', '20')).toEqual({
      page: 3,
      limit: 20,
      skip: 40,
    });
  });

  it.each([
    ['0', '12'],
    ['one', '12'],
    ['1', '0'],
    ['1', '101'],
  ])('rejects invalid page/limit values', (page, limit) => {
    expect(() => paginationOptions(page, limit)).toThrow(BadRequestException);
  });

  it('returns complete pagination metadata', () => {
    expect(paginated([['track'], 25], paginationOptions(2, 10))).toEqual({
      items: ['track'],
      meta: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: true,
      },
    });
  });
});
