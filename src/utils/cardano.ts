import {
  Address,
  Assets,
  Bip32PrivateKey,
  BlockfrostV0,
  ByteArrayData,
  IntData,
  NetworkParams,
  Program,
  Tx,
  TxOutput,
  Value,
  hexToBytes,
} from "@hyperionbt/helios"
import { cwd } from "process"
import { UserDto } from "../users/dto/user.dto.js"
import { walletKeys } from "../../keys/walletKeys.js"
import { NetworkId } from "./types.js"
// import EC from "../on-chain/EscrowContract.js"
import * as fs from "fs"

/** Miscellaneous **/
const fiveMinutes = 1000 * 60 * 5
type Network = "mainnet" | "preprod" | "preview"
type Redeemer = "Cancel" | "Complete" | "Recycle"

/** Blockfrost API reference **/
export function blockfrostApi(
  networkId: NetworkId,
  networkType: "mainnet" | "preprod"
): BlockfrostV0 {
  const projectId =
    networkId === "Mainnet"
      ? process.env.BLOCKFROST_KEY_MAINNET
      : process.env.BLOCKFROST_KEY_TESTNET
  return new BlockfrostV0(networkType, projectId)
}

/**
 * Contracts
 */
// const escrowProgram = Program.new(EC)
// const compiledEscrowScript = escrowProgram.compile(false)
// const escrowScriptHash = compiledEscrowScript.validatorHash
// Because of helios version change, contract addr can differ
// const escrowScriptAddress = Address.fromHash(escrowScriptHash).toBech32()

export function getMintingContract(pubKeyHash: string) {
  const validator = `
minting signed

const OWNER: PubKeyHash = PubKeyHash::new(#${pubKeyHash})

func main(_, ctx: ScriptContext) -> Bool {
    ctx.tx.is_signed_by(OWNER)
}`

  const mintingProgram = Program.new(validator)
  const compiledMintingScript = mintingProgram.compile(false)
  const mintingPolicyHash = compiledMintingScript.mintingPolicyHash

  return { mintingScript: compiledMintingScript, mintingPolicyHash }
}

// const mintingScriptAddress = Address.fromHash(mintingPolicyHash, isTestnet).toBech32()

// console.log("escrow script addr: ", escrowScriptAddress)
// console.log("escrow script hash: ", escrowScriptHash.hex)
// console.log("minting script addr: ", mintingScriptAddress)
// console.log("minting policy hash: ", mintingPolicyHash.hex)
/***/

// ---- Helper functions ----

function getNetworkType(networkId: NetworkId) {
  return networkId === "Mainnet" ? "mainnet" : "preprod"
}

function getHeliosNetworkParams(networkType: Network): NetworkParams {
  const chainConfigPath = cwd() + `/src/on-chain/configs/${networkType}.json`
  const fileData = fs.readFileSync(chainConfigPath, "utf8")
  return new NetworkParams(JSON.parse(fileData))
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
 */
export async function createUnlockingTransaction(
  organizer: UserDto,
  attendee: UserDto,
  redeemerType: Redeemer,
  outputIdCborHex: string,
  lockedValueSchema: string
) {
  // const { networkType } = getProjectConfig()
  // const params = getHeliosNetworkParams(networkType)
  // ! First check if it's possible to construct tx and send it to f-end for signing,
  // then worry about e-thing else

  // --------------- test
  //
  //@ts-ignore
  const orgAddr = new Address(
    "addr_test1qqtd83qaffaczz26lruytuygqc2fx396h45t6x9lxpq7k6v39lqt9m00ckwzlhczj8w8fspaqrtgzhaxagtuxpun9xyqzz09rk"
  )
  //@ts-ignore
  const attAddr = new Address(
    "addr_test1qqtd83qaffaczz26lruytuygqc2fx396h45t6x9lxpq7k6v39lqt9m00ckwzlhczj8w8fspaqrtgzhaxagtuxpun9xyqzz09rk"
  )
  redeemerType = "Cancel"

  // Use this to store the payment-tokens information
  //@ts-ignore
  lockedValueSchema = {
    map: [
      { k: { bytes: "" }, v: { map: [{ k: { bytes: "" }, v: { int: 25000000 } }] } },
      {
        k: { bytes: "6574e6ba313af9f4bbcb1ffde334a9a13f7120190ea3c4aa6530a6ac" },
        v: { map: [{ k: { bytes: "5049474759" }, v: { int: 5000 } }] },
      },
    ],
  }
  outputIdCborHex =
    "825820a431cce9d3a870071e99977d324137afb9a530f37206a3ddc80e0f708ed627a000"
  //
  // -------------- test

  // can i move tx constructing to back end fully?
  // ... and have front end just signing it and submitting
  // ... and showing the tx content in front end
  try {
    // const orgAddr = new Address(organizer.baseAddress)
    // const attAddr = new Address(attendee.baseAddress)
    // I need :
    // - benefactor / beneficiary addr
    // - value to unlock + utxos for tx fee
    // {
    //   txId: TxId | TxIdProps;
    //   utxoId: HInt | HIntProps;
    // };
    // // const blockfrost = blockfrostApi()
    // const txOutId = TxOutputId.fromCbor(outputIdCborHex)
    // const feeUtxos = await blockfrost.getUtxos(orgAddr)
    // const foo = await blockfrost.getUtxos(new Address(escrowScriptAddress))
    // debugger
    // const escrowLockedUTxO = await blockfrost.getUtxo(txOutId)
    // const lockedValue = new Value(schemaToPaymentTokens(lockedValueSchema))
    // const unlockedTxOut = new TxOutput(attAddr, lockedValue)
    // const params = await blockfrost.getParameters()
    // const epoch = await blockfrost.getLatestEpoch()
    // // construct redeemer
    // let redeemer: any
    // if (redeemerType === "Cancel") {
    //   redeemer = new escrowProgram.types.Redeemer[redeemerType](
    //     escrowLockedUTxO.outputId.txId,
    //     escrowLockedUTxO.outputId.utxoIdx
    //   )
    // } else if (redeemerType === "Complete") {
    // } else if (redeemerType === "Recycle") {
    // } else throw new Error(`Unknow redeemer type: ${redeemerType}`)
    // const now = Date.now()
    // const tx = new Tx()
    //   .attachScript(compiledEscrowScript)
    //   .addInputs([escrowLockedUTxO], redeemer)
    //   .addInputs(feeUtxos)
    //   .addOutput(unlockedTxOut)
    //   .addOutput(new TxOutput(orgAddr, new Value({ lovelace: 1_500_000n })))
    //   .validFrom(new Date(now))
    //   .validTo(new Date(now + fiveMinutes))
    // debugger
    // await tx.finalize(params, attAddr)
    // return tx.toCborHex()
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function mintBetaTesterToken(
  userAddress: string,
  tokenIdx: number,
  networkId: NetworkId
): Promise<string | void> {
  try {
    // ... get the treasury keys ...
    // should work for signing a tx with utxos at baseAddress
    const privKeyArray = Array.from(
      Buffer.from(walletKeys[networkId].accountKeyHex, "hex")
    )
    const privKey = new Bip32PrivateKey(privKeyArray).derive(0).derive(0)
    const pubKeyHash = privKey.derivePubKey().pubKeyHash

    const networkType = getNetworkType(networkId)
    const blockfrost = blockfrostApi(networkId, networkType)
    const params = getHeliosNetworkParams(networkType)
    const treasuryAddress = new Address(
      networkId === "Mainnet"
        ? process.env.TREASURY_ADDRESS_MAINNET
        : process.env.TREASURY_ADDRESS_TESTNET
    )
    const treasuryUtxos = await blockfrost.getUtxos(treasuryAddress)
    const { mintingPolicyHash, mintingScript } = getMintingContract(pubKeyHash.hex)

    const nftTokenName = ByteArrayData.fromString(`Beta_Tester#${tokenIdx}`).toHex()
    const tokens: [number[], bigint][] = [[hexToBytes(nftTokenName), BigInt(1)]]
    const betaTesterToken = new Assets([[mintingPolicyHash, tokens]])

    const output = new TxOutput(
      new Address(userAddress),
      new Value(1_000_000, betaTesterToken)
    )

    const now = Date.now()
    const tx = new Tx()
      .attachScript(mintingScript)
      // redeemer is always needed even if we don't use it (?)
      .mintTokens(mintingPolicyHash, tokens, new IntData(1n))
      .addInputs(treasuryUtxos)
      .addOutput(output)
      .validFrom(new Date(now - fiveMinutes))
      .validTo(new Date(now + fiveMinutes))
      .addSigner(pubKeyHash)

    await tx.finalize(params, new Address(walletKeys.baseAddress), treasuryUtxos)
    let signature = privKey.sign(tx.bodyHash)
    tx.addSignature(signature)

    return (await blockfrost.submitTx(tx)).hex
  } catch (e) {
    throw e
  }
}
