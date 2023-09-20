import { Controller, Get, Post, Param } from "@nestjs/common"
import { BTCService, ETHService, ADAService } from "./crypto.service.js"

@Controller("btc")
export class BTCController {
  constructor(private readonly btcService: BTCService) {}

  @Post()
  async requestBlockCount(): Promise<any> {
    return this.btcService.requestBlockCount()
  }
  @Get("getblockcount")
  getBlockCount() {
    return this.btcService.getBlockCount()
  }

  @Get("getbestblockhash")
  getBestBlockHash() {
    return this.btcService.getBestBlockHash()
  }
}

@Controller("eth")
export class ETHController {}

@Controller("ada")
export class ADAController {}
