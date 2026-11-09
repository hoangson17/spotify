import { BadRequestException } from '@nestjs/common';
import { categoryFields, trackFields } from './catalog-input';

describe('trackFields', () => {
  const categoryId = '123e4567-e89b-42d3-a456-426614174000';

  it('maps a category UUID to a track relation', () => {
    expect(trackFields({ category: categoryId })).toEqual({
      category: { id: categoryId },
    });
  });

  it.each(['', null])('allows category to be cleared with %p', (category) => {
    expect(trackFields({ category })).toEqual({ category: null });
  });

  it('rejects an invalid category UUID', () => {
    expect(() => trackFields({ category: 'invalid' })).toThrow(
      BadRequestException,
    );
  });
});

describe('categoryFields', () => {
  it('normalizes category fields', () => {
    expect(
      categoryFields({
        name: '  Pop  ',
        description: '',
        hexHexadecimal: '#1DB954',
      }),
    ).toEqual({
      name: 'Pop',
      description: null,
      hexHexadecimal: '#1DB954',
    });
  });

  it('rejects an invalid category color', () => {
    expect(() =>
      categoryFields({ name: 'Pop', hexHexadecimal: 'green' }),
    ).toThrow(BadRequestException);
  });
});
