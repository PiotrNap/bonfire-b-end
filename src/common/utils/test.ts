import {Address} from "cardano-js";
import { range } from "./utils";
// function thisIsATest() {
//   let r = range(1000000,10000000);
//   for (let i of r) {
//     let r = Address.Util.isAddress(
//       "addr_test1vqdaezgllu2g7lnkx60y7xyea4mvutxtgr49w25hrv6wfks9qn5ss",
//       i
//     );
//     console.log(i)
//     if (r === true) {return i} else { continue };
//   }
// }
//  console.log(thisIsATest());
//  console.log(dando.Currency.Util.lovelacesToAda("1213215158778"))



///////////////////////////////////////////////////////////////////////////////////////////
import axios from "axios";

function getLatestBlockHeight() {
  return axios
    .get(
      `https://blockscout.com/etc/mainnet/api?module=block&action=eth_block_number`
    )
    .then((r) => {
      return r.data.result;
    })
    .then((r) => {
      return parseInt(r);
    });
}

function getSupply() {
  return axios
    .get(`https://blockscout.com/etc/mainnet/api?module=stats&action=ethsupply`)
    .then((r) => {
      return r.data.result;
    });
}

function getLatestInfo(blockNumber) {
  return axios
    .get(
      `https://blockscout.com/etc/mainnet/api?module=block&action=getblockreward&blockno=${blockNumber}`
    )
    .then(async (r) => {
      return await r.data.result;
    })
    .then(async (r) => {
let obj = {
         blockMiner: r.blockMiner,
         blockNumber: r.blockNumber,
         blockReward: r.blockReward,
         timestamp: r.timeStamp,
         uncleReward: r.uncleInclusionReward,
         uncles: r.uncles,
       };
       return obj;
     })}

async function execute() {
  console.log(await getLatestBlockHeight());
  console.log(await getSupply());
  console.log(await getLatestInfo(await getLatestBlockHeight()));
}

execute();
