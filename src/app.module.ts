import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController, AuthGoogleController, AuthGoogleEventsController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule,
} from "./auth/auth.module";
import { GoogleService } from "./auth/services/google/google.service";
import { logger } from "./common/middleware/logger.middleware";
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [
    AppController,
    AuthGoogleController,
    AuthGoogleEventsController
  ],
  providers: [AppService, GoogleService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(logger)
    .forRoutes('*')
  };
}
