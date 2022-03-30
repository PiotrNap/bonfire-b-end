import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import * as cookieParser from "cookie-parser"
import * as dotenv from "dotenv"
import { ValidationPipe } from "@nestjs/common"
dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(new ValidationPipe(), cookieParser())
  // @TODO: remove before deploying
  app.enableCors()
  await app.listen(8000)
}
bootstrap()
