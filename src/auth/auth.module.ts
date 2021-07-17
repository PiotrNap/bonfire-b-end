import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthStrategy } from './auth.strategy';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  providers: [AuthStrategy],
})
export class AuthModule {}
