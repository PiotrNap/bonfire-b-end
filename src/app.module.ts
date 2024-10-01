import { AppController } from "./app.controller.js"

import { AppService } from "./app.service.js"
import { AuthModule } from "./auth/auth.module.js"
import { logger } from "./common/middleware/logger.middleware.js"
import { UsersModule } from "./users/users.module.js"
import { TypeOrmModule } from "@nestjs/typeorm"
import { configService } from "./config/config.service.js"
import { CryptoModule } from "./crypto/crypto.module.js"
import { HttpModule } from "@nestjs/axios"
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard.js"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerModule } from "@nestjs/throttler"
import { EventsModule } from "./events/events.module.js"
import { ConfigModule } from "@nestjs/config"
import { UploadModule } from "./upload/uplaod.module.js"

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    CryptoModule,
    HttpModule,
    AuthModule,
    UsersModule,
    UploadModule,
    EventsModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 25,
      },
    ]),
  ],
  controllers: [AppController],
  // enable jwt & roles guards globally
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes("*")
  }
}
