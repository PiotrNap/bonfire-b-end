import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { initializeApp } from "firebase-admin/app"
import { AppModule } from "./app.module.js"
import { loadModel } from "./common/utils.js"
import cookieParser from "cookie-parser"
import xss from "xss-clean"
import * as dotenv from "dotenv"

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(new ValidationPipe(), cookieParser(), xss())

  app.enableCors({
    allowedHeaders: [
      process.env.WEBSITE_URL,
      process.env.NODE_ENV === "dev" && "http://localhost:3000",
    ],
  })
  await loadModel()
  initializeApp()

  await app.listen(8000)
}
bootstrap()
