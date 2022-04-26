import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"

import * as cookieParser from "cookie-parser"
import * as dotenv from "dotenv"
import { loadModel } from "./common/utils"
dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(new ValidationPipe(), cookieParser())

  // @TODO: remove before deploying
  app.enableCors()
  await loadModel()

  await app.listen(8000)
}
bootstrap()
