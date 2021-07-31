import { Injectable } from "@nestjs/common";
import * as utils from "../common/utils/utils";
import * as RpcClient from "bitcoind-rpc";

const bitcoindConfig = {
  protocol: "http",
  user: "ocg",
  pass: "test",
  host: "127.0.0.1",
  port: "8332",
};
const rpc = new RpcClient(bitcoindConfig);

@Injectable()
export class CryptoService {
  getBestBlockHash() {
    return rpc.getbestblockhash();
  }
  getBlock() {
    return rpc.getblock();
  }
  getBlockchainInfo() {
    return rpc.getblockchaininfo;
  }
  getBlockCount() {
    return rpc.getblockcount;
  }
  getBlockFilter() {
    return rpc.getblockfilter();
  }
  getBlockHash(i) {
    return rpc.getblockhash(i);
  }
  getBlockHeader(i) {
    return rpc.getblockheader(i);
  }
  getBlockStats(i) {
    return rpc.getblockstats(i);
  }
}
