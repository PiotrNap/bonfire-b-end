// import {
//   AppController,
//   AuthGoogleController,
//   AuthGoogleEventsController,
// } from "./app.controller";

// import { AppService } from "./app.service";
// import { AuthModule } from "./auth/auth.module";
// import { GoogleService } from "./auth/services/google/google.service";
// import { logger } from "./common/middleware/logger.middleware";
// import { UsersModule } from "./users/users.module";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { configService } from "./config/config.service";
// import { BTCService, ETHService, ADAService } from './crypto/crypto.service';
// import { CryptoModule } from './crypto/crypto.module';
// import { HttpModule } from "@nestjs/axios";
// import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
// import { BTCController, ETHController, ADAController } from './crypto/crypto.controller';

// @Module({
//   imports: [
//     CryptoModule,
//     HttpModule,
//     AuthModule, 
//     UsersModule, 
//     TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    
//   ],
//   controllers: [
//     AppController,
//     AuthGoogleController,
//     AuthGoogleEventsController,
//     BTCController,
//     ETHController,
//     ADAController
//   ],
//   providers: [
//     AppService, 
//     GoogleService, 
//     BTCService,
//     ETHService,
//     ADAService
//   ],
// })
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(logger).forRoutes("*");
//   }
// }


import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { TodoModule } from './todo/todo.module';
import { ConnectionOptions } from 'typeorm';
import { UsersModule } from './users/users.module';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule]
})
export class AppModule {
  static forRoot(connOptions: ConnectionOptions): DynamicModule {
    return {
      module: AppModule,
      controllers: [AppController],
      imports: [
        AuthModule,
        UsersModule,
        CoreModule,
        TypeOrmModule.forRoot(connOptions),
      ],
      providers: [AppService],
    };
  }
}