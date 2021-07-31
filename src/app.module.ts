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
// import { ItemController } from './item/item.controller';
// import { ItemService } from './item/item.service';
// import { ItemModule } from './item/item.module';
// import { DbService } from './db/db.service';
// import { DbModule } from './db/db.module';
@Module({
  imports: [
    HttpModule,
    AuthModule, 
    UsersModule, 
    //ItemModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    //DbModule
  ],
  controllers: [
    AppController,
    AuthGoogleController,
    AuthGoogleEventsController,
  ],
  providers: [
    AppService, 
    GoogleService, 
    //DbService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes("*");
  }
}
