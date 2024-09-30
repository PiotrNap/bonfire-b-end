import { config } from "dotenv"
config()

import {
  Address,
  AssetClass,
  Assets,
  Bip32PrivateKey,
  ByteArrayData,
  MintingPolicyHash,
  Program,
  PubKeyHash,
  TxBuilder,
  Value,
} from "@helios-lang/compat"
import { BlockfrostV0 } from "@helios-lang/tx-utils"
import { DEFAULT_NETWORK_PARAMS, TokenValue } from "@helios-lang/ledger-conway"
import { MintingContext } from "@helios-lang/ledger-conway/types/tx"
import { NativeScript } from "@helios-lang/ledger"
import type { AssetsLike } from "@helios-lang/ledger-babbage/types/money/Assets.js"
import { setEra } from "@helios-lang/era"
setEra("Conway")

/** Blockfrost API reference **/
export function blockfrostApi(isMainnet: boolean): BlockfrostV0 {
  const networkType = isMainnet ? "mainnet" : "preprod"
  const projectId = process.env[`BLOCKFROST_KEY_${networkType.toUpperCase()}`]

  return new BlockfrostV0(networkType, projectId)
}

// PubKeyHash checked at 27Aug2024
const program = `
minting signed

import { tx } from ScriptContext

const OWNER: PubKeyHash = PubKeyHash::new(#84e6f5ca8f28b6401742a20119073c64685cd7d7c11b6504b5274075)

func main(_) -> Bool {
    tx.is_signed_by(OWNER)
}`
const mintingProgram = new Program(program)
const compiledMintingScript = mintingProgram.compile(false)
const mintingPolicyHash = new MintingPolicyHash<MintingContext<any, 1>>(
  compiledMintingScript.hash()
)

// console.log("minting script addr: ", mintingScriptAddress)
console.log("minting policy hash: ", mintingPolicyHash.toHex())
/***/

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

export async function mintBetaTesterToken(
  userAddress: string,
  tokenIdx: number,
  isMainnet: boolean
): Promise<string | void> {
  try {
    const blockfrost = blockfrostApi(isMainnet)

    const privKeyArray = Array.from(Buffer.from(process.env.TREASURY_ACCOUNT_KEY, "hex"))
    const privKey = new Bip32PrivateKey(privKeyArray).derive(0).derive(0)
    const pubKey = privKey.derivePubKey().toHash()
    const treasuryAddress = Address.fromHash(isMainnet, pubKey)
    const treasuryUtxos = await blockfrost.getUtxos(treasuryAddress)

    const nftTokenName = ByteArrayData.fromString(`bonfire_beta_tester#${tokenIdx}`).bytes
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
