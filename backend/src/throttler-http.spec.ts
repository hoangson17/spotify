import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';

@Controller('throttler-test')
class LimitedController {
  @Get()
  get() {
    return { success: true };
  }
}

describe('HTTP throttling', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          { name: 'default', limit: 2, ttl: 60_000 },
        ]),
      ],
      controllers: [LimitedController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns rate-limit headers and blocks requests over the limit', async () => {
    const first = await request(app.getHttpServer())
      .get('/throttler-test')
      .expect(200);
    expect(first.headers['x-ratelimit-limit']).toBe('2');

    await request(app.getHttpServer()).get('/throttler-test').expect(200);
    await request(app.getHttpServer()).get('/throttler-test').expect(429);
  });
});
