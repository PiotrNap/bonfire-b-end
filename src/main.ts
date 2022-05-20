import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { initializeApp } from "firebase-admin/app"
import * as dotenv from "dotenv"
import * as cookieParser from "cookie-parser"

import { AppModule } from "./app.module"
import { loadModel } from "./common/utils"
dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(new ValidationPipe(), cookieParser())

  // @TODO: remove before deploying
  app.enableCors()
  await loadModel()
  initializeApp()

  await app.listen(8000)
}
bootstrap()
