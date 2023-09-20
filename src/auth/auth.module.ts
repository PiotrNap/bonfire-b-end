import { forwardRef, Module } from "@nestjs/common"
import { AuthController } from "./auth.controller.js"
import { AuthService } from "./auth.service.js"
import { UsersModule } from "../users/users.module.js"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { JwtStrategy } from "./strategies/jwt.strategy.js"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "../model/user.entity.js"

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    TypeOrmModule.forFeature([UserEntity]),
    // ConfigModule is loaded async, wait for it to load with `registerAsync`
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("EXPIRES_IN"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
