import { config } from "dotenv"
config()

import {
  Address,
  AssetClass,
  Assets,
  Bip32PrivateKey,
  ByteArrayData,
  IntData,
  MintingPolicyHash,
  Program,
  PubKeyHash,
  TxBuilder,
  TxInput,
  TxOutput,
  ValidatorHash,
  Value,
  hexToBytes,
} from "@helios-lang/compat"
import { BlockfrostV0 } from "@helios-lang/tx-utils"
import { TokensLike } from "@helios-lang/ledger-babbage/types/money/Assets.js"
import { DEFAULT_NETWORK_PARAMS, TokenValue } from "@helios-lang/ledger-conway"
import { MintingContext } from "@helios-lang/ledger-conway/types/tx"
import { NativeScript } from "@helios-lang/ledger"
import type { AssetsLike } from "@helios-lang/ledger-babbage/types/money/Assets.js"
import { setEra } from "@helios-lang/era"
setEra("Conway")

import { cwd } from "process"
import EC from "../on-chain/EscrowContract.js"
import MC from "../on-chain/MintingContract.js"
import { walletKeys } from "../../keys/walletKeys.js"
import * as fs from "fs"
import { isLocale } from "class-validator"

/** Miscellaneous **/
const fiveMinutes = 1000 * 60 * 5
type Network = "mainnet" | "preprod" | "preview"
type Redeemer = "Cancel" | "Complete" | "Recycle"
const networkType = process.env.CARDANO_NETWORK as Network
const isMainnet = networkType === "mainnet"

/** Blockfrost API reference **/
export function blockfrostApi(): BlockfrostV0 {
  const { networkType, projectId } = getProjectConfig()
  return new BlockfrostV0(networkType, projectId)
}

/**
 * Contracts
 */
const escrowProgram = new Program(EC)
const compiledEscrowScript = escrowProgram.compile(false)
const escrowScriptHash = new ValidatorHash(compiledEscrowScript.hash())
// Because of helios version change, contract addr can differ
const escrowScriptAddress = Address.fromHash(isMainnet, escrowScriptHash).toBech32()

const mintingProgram = new Program(MC)
const compiledMintingScript = mintingProgram.compile(false)
const mintingPolicyHash = new MintingPolicyHash<MintingContext<any, 1>>(
  compiledMintingScript.hash()
)
// const mintingScriptAddress = Address.fromHash(mintingPolicyHash, isTestnet).toBech32()

console.log("escrow script addr: ", escrowScriptAddress)
console.log("escrow script hash: ", escrowScriptHash.toHex())
// console.log("minting script addr: ", mintingScriptAddress)
console.log("minting policy hash: ", mintingPolicyHash.toHex())
/***/

// ---- Helper functions ----
function getProjectConfig() {
  const k = `BLOCKFROST_KEY_${networkType.toUpperCase()}`
  return {
    networkType,
    projectId: process.env[k],
  }
}

function bytesToText(bytes) {
  return String.fromCharCode(...bytes.match(/.{2}/g).map((byte) => parseInt(byte, 16)))
}

function schemaToPaymentTokens(schema) {
  const paymentTokenAssetsArray = []
  let paymentLovelace = 0

  schema.map.forEach((entry) => {
    const assetId = entry.k.bytes
    if (assetId === "") {
      // Extract lovelace value
      paymentLovelace = entry.v.map[0].v.int
    } else {
      // Extract token information
      const tokensArray = entry.v.map.map((tokenEntry) => {
        const tokenName = bytesToText(tokenEntry.k.bytes)
        const tokenAmt = BigInt(tokenEntry.v.int)
        return [Array.from(tokenName).map((char) => char.charCodeAt(0)), tokenAmt]
      })
      paymentTokenAssetsArray.push([assetId, tokensArray])
    }
  })

  const paymentTokenAssets = new Assets(paymentTokenAssetsArray)
  return new Value(paymentLovelace, paymentTokenAssets)
}
//------------

/**
 * Creates unlocking transaction from Escrow SC
 * ( >>> OBSOLETE <<< )
 */
//export async function createUnlockingTransaction(
//  organizer: UserDto,
//  attendee: UserDto,
//  redeemerType: Redeemer,
//  outputIdCborHex: string,
//  lockedValueSchema: string
//) {
//  const { networkType } = getProjectConfig()
//  const params = getHeliosNetworkParams(networkType)
//  // ! First check if it's possible to construct tx and send it to f-end for signing,
//  // then worry about e-thing else

//  // --------------- test
//  //
//  //@ts-ignore
//  const orgAddr = new Address(
//    "addr_test1qqtd83qaffaczz26lruytuygqc2fx396h45t6x9lxpq7k6v39lqt9m00ckwzlhczj8w8fspaqrtgzhaxagtuxpun9xyqzz09rk"
//  )
//  //@ts-ignore
//  const attAddr = new Address(
//    "addr_test1qqtd83qaffaczz26lruytuygqc2fx396h45t6x9lxpq7k6v39lqt9m00ckwzlhczj8w8fspaqrtgzhaxagtuxpun9xyqzz09rk"
//  )
//  redeemerType = "Cancel"

//  // Use this to store the payment-tokens information
//  //@ts-ignore
//  lockedValueSchema = {
//    map: [
//      { k: { bytes: "" }, v: { map: [{ k: { bytes: "" }, v: { int: 25000000 } }] } },
//      {
//        k: { bytes: "6574e6ba313af9f4bbcb1ffde334a9a13f7120190ea3c4aa6530a6ac" },
//        v: { map: [{ k: { bytes: "5049474759" }, v: { int: 5000 } }] },
//      },
//    ],
//  }
//  outputIdCborHex =
//    "825820a431cce9d3a870071e99977d324137afb9a530f37206a3ddc80e0f708ed627a000"
//  //
//  // -------------- test

//  // can i move tx constructing to back end fully?
//  // ... and have front end just signing it and submitting
//  // ... and showing the tx content in front end
//  try {
//    // const orgAddr = new Address(organizer.baseAddress)
//    // const attAddr = new Address(attendee.baseAddress)

//    // I need :
//    // - benefactor / beneficiary addr

//    // - value to unlock + utxos for tx fee
//    // {
//    //   txId: TxId | TxIdProps;
//    //   utxoId: HInt | HIntProps;
//    // };

//    const blockfrost = blockfrostApi()
//    const txOutId = TxOutputId.fromCbor(outputIdCborHex)
//    const feeUtxos = await blockfrost.getUtxos(orgAddr)
//    const foo = await blockfrost.getUtxos(new Address(escrowScriptAddress))
//    debugger
//    const escrowLockedUTxO = await blockfrost.getUtxo(txOutId)
//    const lockedValue = new Value(schemaToPaymentTokens(lockedValueSchema))
//    const unlockedTxOut = new TxOutput(attAddr, lockedValue)
//    const params = await blockfrost.getParameters()
//    const epoch = await blockfrost.getLatestEpoch()

//    // construct redeemer
//    let redeemer: any
//    if (redeemerType === "Cancel") {
//      redeemer = new escrowProgram.types.Redeemer[redeemerType](
//        escrowLockedUTxO.outputId.txId,
//        escrowLockedUTxO.outputId.utxoIdx
//      )
//    } else if (redeemerType === "Complete") {
//    } else if (redeemerType === "Recycle") {
//    } else throw new Error(`Unknow redeemer type: ${redeemerType}`)

//    const now = Date.now()
//    const tx = new Tx()
//      .attachScript(compiledEscrowScript)
//      .addInputs([escrowLockedUTxO], redeemer)
//      .addInputs(feeUtxos)
//      .addOutput(unlockedTxOut)
//      .addOutput(new TxOutput(orgAddr, new Value({ lovelace: 1_500_000n })))
//      .validFrom(new Date(now))
//      .validTo(new Date(now + fiveMinutes))
//    debugger

//    await tx.finalize(params, attAddr)

//    return tx.toCborHex()
//  } catch (e) {
//    console.error(e)
//    throw e
//  }
//}

export async function mintBetaTesterToken(
  userAddress: string,
  tokenIdx: number
): Promise<string | void> {
  try {
    const blockfrost = blockfrostApi()

    const privKeyArray = Array.from(Buffer.from(walletKeys.accountKeyHex, "hex"))
    const privKey = new Bip32PrivateKey(privKeyArray).derive(0).derive(0)
    const pubKey = privKey.derivePubKey().toHash()
    const treasuryAddress = Address.fromHash(isMainnet, pubKey)
    const treasuryUtxos = await blockfrost.getUtxos(treasuryAddress)

    const nftTokenName = ByteArrayData.fromString(`Beta_Tester#${tokenIdx}`).bytes
    const mintingScript = NativeScript.Sig(
      new PubKeyHash("84e6f5ca8f28b6401742a20119073c64685cd7d7c11b6504b5274075")
    )
    const mph = new MintingPolicyHash(mintingScript.hash())
    const ac = new AssetClass(mph, nftTokenName)
    const tokenValue: TokenValue<any> = new TokenValue(ac, BigInt(1))
    const tokens: AssetsLike = [[mph, [[nftTokenName, BigInt(1)]]]]

    const receiverAddr: Address<any, any> = Address.fromBech32(userAddress)
    const collateralIn = treasuryUtxos.find(
      (tx) => tx.output.value.lovelace <= 10_000_000n
    )

    const tx = new TxBuilder({ isMainnet })
      .attachNativeScript(mintingScript)
      .mint(tokenValue)
      //@ts-ignore
      .spend(treasuryUtxos)
      .pay(receiverAddr, new Value(1_000_000, tokens))
      .pay(treasuryAddress, 5_000_000)
      .addCollateral(collateralIn)
      .addSigners(pubKey)

    const readyTx = await tx.build({
      changeAddress: treasuryAddress,
      networkParams: DEFAULT_NETWORK_PARAMS(),
      spareUtxos: treasuryUtxos,
    })

    let signature = privKey.sign(readyTx.body.hash())
    readyTx.addSignature(signature)

    return (await blockfrost.submitTx(readyTx)).toHex()
  } catch (e) {
    throw e
  }
}

// export async function finalizePlutusTx(body, user: UserDto) {
//   const network = process.env.CARDANO_NETWORK
//   console.log("body ?", body)
//   console.log("network ?", network)
//   console.log("user ?", user)
//   try {
//     const chainConfig = await readFile(
//       cwd() + `/src/config/cardano/${network}.json`
//     ).then((res) => res.toString())
//     const params = new NetworkParams(chainConfig)
//     const { txCbor, txInputs, escrowProgramCbor } = body
//     if (!txCbor) throw new Error("Missing txCbor from request payload")
//     if (!escrowProgramCbor) throw new Error("Missing Cbor of escrow program")
//     debugger
//     // let txBody = TxBody.fromCbor(txCbor)
//     let _txInputs = txInputs.map((cbor) => TxInput.fromCbor(cbor))
//     debugger
//     let tx = Tx.fromCbor(txCbor).addInputs(_txInputs)
//     let address = new Address(user.baseAddress)
//     debugger
//     // let escrowProgram = UplcProgram.fromCbor(escrowProgramCbor)
//     // tx.attachScript(escrowProgram)
//     tx.finalize(params, address)
//     // should return Cbor of transaction
//     return tx.toCbor()
//   } catch (e) {
//     console.error(e)
//   }
// }
