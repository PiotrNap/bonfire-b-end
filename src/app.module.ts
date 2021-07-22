import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import {
  AppController,
  AuthGoogleController,
  AuthGoogleEventsController,
} from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { GoogleService } from "./auth/services/google/google.service";
import { logger } from "./common/middleware/logger.middleware";
import { UsersModule } from "./users/users.module";
//import { CryptoModule } from "./crypto/crypto.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configService } from "./config/config.service";
@Module({
  imports: [AuthModule, UsersModule, HttpModule,
  TypeOrmModule.forRoot(configService.getTypeOrmConfig())],
  controllers: [
    AppController,
    AuthGoogleController,
    AuthGoogleEventsController,
  ],
  providers: [AppService, GoogleService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes("*");
  }
}
