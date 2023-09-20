import { Module } from "@nestjs/common"
import { HttpExceptionFilter } from "./http-exception.filter.js"
import { APP_FILTER } from "@nestjs/core"

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class CoreModule {}
