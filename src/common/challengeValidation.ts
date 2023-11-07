import { base64ToUint8Array, base64ToUTF8 } from "../common/utils.js"
import { sha256 } from "js-sha256"
import nacl from "tweetnacl"
import { DeviceCredentialEntity } from "../model/deviceCredential.entity.js"

const { sign } = nacl

export class ChallengeResponseValidation {
  public validate(
    deviceCredential: DeviceCredentialEntity,
    signature: string,
    challenge: string
  ): boolean {
    var { publicKey } = deviceCredential
    const TTL = 600000 // time to live 10 minutes

    const challArray = base64ToUTF8(challenge).split("_")
    var [publicKey, challengeTime, challengeHash] = challArray

    const passedTime = new Date().getTime() - Number(challengeTime)
    const newHash = sha256(publicKey + challengeTime + process.env.JWT_SECRET)
    if (!publicKey || passedTime > TTL || challengeHash !== newHash)
      return false

    // challenge hasn't been changed and the 10 min time span hasn't been reached
    return sign.detached.verify(
      base64ToUint8Array(challenge),
      base64ToUint8Array(signature),
      base64ToUint8Array(publicKey)
    )
  }
}
