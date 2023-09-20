import { Module } from "@nestjs/common"
import { IdTokenController } from "./id-token.controller.js"
import { IdTokenService } from "./id-token.service.js"

@Module({
  controllers: [IdTokenController],
  providers: [IdTokenService],
})
export class IdTokenModule {}
