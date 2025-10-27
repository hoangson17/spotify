import { Test, TestingModule } from '@nestjs/testing';
import { LikeTracksController } from './like-tracks.controller';

describe('LikeTracksController', () => {
  let controller: LikeTracksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeTracksController],
    }).compile();

    controller = module.get<LikeTracksController>(LikeTracksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
