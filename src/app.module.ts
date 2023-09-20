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
import { EventsModule } from "./events/events.module.js"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env.dev",
      isGlobal: true,
    }),
    CryptoModule,
    HttpModule,
    AuthModule,
    UsersModule,
    EventsModule,
    // IdTokenModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
  ],
  controllers: [AppController],
  // enable jwt & roles guards globally
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes("*")
  }
}
