import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Track } from 'src/entities/track.entity';
import { LikeTracksController } from './like-tracks.controller';

@Module({
  controllers: [UserController, LikeTracksController],
  providers: [UserService],
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
  TypeOrmModule.forFeature([User,Track])
  ],
})
export class UserModule {}
