import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { BTCService, ETHService, ADAService } from "./crypto.service"

@Module({
  imports: [HttpModule],
  providers: [BTCService, ETHService, ADAService],
})
export class CryptoModule {}
