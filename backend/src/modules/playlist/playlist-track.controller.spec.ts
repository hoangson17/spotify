import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistTrackController } from './playlist-track.controller';

describe('PlaylistTrackController', () => {
  let controller: PlaylistTrackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistTrackController],
    }).compile();

    controller = module.get<PlaylistTrackController>(PlaylistTrackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
