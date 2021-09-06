import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import { ValidationPipe } from "@nestjs/common";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new ValidationPipe(), cookieParser());
  // app.useGlobalGuards(new JwtAuthGuard(new Reflector()));

  // @TODO: remove before deploying
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
