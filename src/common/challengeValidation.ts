import { base64ToUint8Array, base64ToUTF8 } from "../common/utils.js"
import { sha256 } from "js-sha256"
import * as nacl from "tweetnacl"

export class ChallengeResponseValidation {
  public validate(
    user: UserEntity,
    signature: string,
    challenge: string,
    userCredential: { [index: string]: any }
  ): boolean {
    var { publicKey } = user
    var TTL = 600000 // time to live 10 minutes

    var challArray = base64ToUTF8(challenge).split("_")
    var [publicKey, challengeTime, challengeHash] = challArray

    var passedTime = new Date().getTime() - Number(challengeTime)
    var newHash = sha256(publicKey + challengeTime + process.env.JWT_SECRET)
    if (
      publicKey !== userCredential.publicKey ||
      passedTime > TTL ||
      challengeHash !== newHash
    )
      return false

    // challenge hasn't been changed and the 10 min time span hasn't been reached
    return nacl.sign.detached.verify(
      base64ToUint8Array(challenge),
      base64ToUint8Array(signature),
      base64ToUint8Array(publicKey)
    )
  }
}
