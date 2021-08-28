import {
  AppController,
  AuthGoogleController,
  AuthGoogleEventsController,
} from "./app.controller";

import { AppService } from "./app.service";
import { AuthService } from "./auth/auth.service";
import { AuthModule } from "./auth/auth.module";
import { GoogleService } from "./auth/services/google/google.service";
import { logger } from "./common/middleware/logger.middleware";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configService } from "./config/config.service";
import { BTCService, ETHService, ADAService } from './crypto/crypto.service';
import { CryptoModule } from './crypto/crypto.module';
import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { BTCController, ETHController, ADAController } from './crypto/crypto.controller';
import { IdTokenModule } from './id-token/id-token.module';

@Module({
  imports: [
    CryptoModule,
    HttpModule,
    AuthModule, 
    UsersModule, 
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()), IdTokenModule,
    
  ],
  controllers: [
    AppController,
    // AuthGoogleController,
    // AuthGoogleEventsController,
    // BTCController,
    // ETHController,
    // ADAController
  ],
  providers: [
    AuthService,
    AppService, 
    // GoogleService, 
    // BTCService,
    // ETHService,
    // ADAService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes("*");
  }
}
