import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { paginated, paginationOptions } from 'src/utils/pagination';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options = paginationOptions(page, limit);
    if (!q?.trim()) {
      return {
        tracks: paginated([[], 0], options),
        albums: paginated([[], 0], options),
        artists: paginated([[], 0], options),
      };
    }
    return this.searchService.searchAll(q, options);
  }
}
