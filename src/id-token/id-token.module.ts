import { Module } from "@nestjs/common"
import { IdTokenService } from "./id-token.service"
import { IdTokenController } from "./id-token.controller"

@Module({
  controllers: [IdTokenController],
  providers: [IdTokenService],
})
export class IdTokenModule {}
