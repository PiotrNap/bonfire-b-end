import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";
 

@Injectable()
export class BTCService {
  constructor(private httpService: HttpService) {}
  data = {
    protocol: "http",
    user: "ocg",
    pass: "test",
    host: "127.0.0.1",
    port: "8332",
  };
  getBlockCount(): Observable<AxiosResponse<any>> {
    return this.httpService.post("http://127.0.0.1:8332",this.data);
  }
  requestBlockCount() {};
  getBestBlockHash() {
    return "blockhash";
  }
  getConnectionCount() {}
  getDifficulty() {}
  getBlockchainInfo() {}
  getMiningInfo() {}
  getPeerInfo() {}
  getRawMempool() {}
  getBlockByHash() {}
  getBlockHash() {}
  getRawTxID() {}
  decodeRawTxHex() {}
}
@Injectable()
export class ETHService {}
@Injectable()
export class ADAService {}
