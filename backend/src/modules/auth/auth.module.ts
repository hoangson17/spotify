import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import Mail from 'src/utils/mail';
import { EmailConsumer } from 'src/consumer/email.consumer';

@Module({
  controllers: [AuthController],
  providers: [AuthService,Mail,EmailConsumer],
  exports:[AuthService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register  ({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.JWT_TOKEN_EXPIRED) },
    }),
    BullModule.registerQueue({
      name: 'mailRegister',
    })
  ],
}) 
export class AuthModule {}
