import { AppController } from "./app.controller"

import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { logger } from "./common/middleware/logger.middleware"
import { UsersModule } from "./users/users.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { configService } from "./config/config.service"
import { CryptoModule } from "./crypto/crypto.module"
import { HttpModule } from "@nestjs/axios"
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { IdTokenModule } from "./id-token/id-token.module"
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"
import { APP_GUARD } from "@nestjs/core"
import { EventsModule } from "./events/events.module"
import { RolesGuard } from "./auth/roles/roles.guard"
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
    IdTokenModule,
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes("*")
  }
}
