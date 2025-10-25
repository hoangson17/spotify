import { Test, TestingModule } from '@nestjs/testing';
import { ArtistTrackController } from './artist-track.controller';

describe('ArtistTrackController', () => {
  let controller: ArtistTrackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistTrackController],
    }).compile();

    controller = module.get<ArtistTrackController>(ArtistTrackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
