import { UserEntity } from "src/model/user.entity";
import { base64ToUint8Array, base64ToUTF8 } from "src/common/utils";
import { sha256 } from "js-sha256";
import * as nacl from "tweetnacl";

export class ChallengeResponseValidation {
  public validate(
    user: UserEntity,
    signature: string,
    challenge: string,
    userCredential: { [index: string]: any }
  ): boolean {
    var { publicKey } = user;
    var TTL = 600000; // time to live 10 minutes

    var challArray = base64ToUTF8(challenge).split("_");
    var [challengeCredential, challengeTime, challengeHash] = challArray;

    var passedTime = new Date().getTime() - Number(challengeTime);
    var newHash = sha256(
      challengeCredential + challengeTime + process.env.JWT_SECRET
    );

    if (
      challengeCredential !== user[Object.keys(userCredential)[0]] ||
      passedTime > TTL ||
      challengeHash !== newHash
    )
      return false;

    // challenge hasn't been changed and the 10 min time span hasn't been reached
    return nacl.sign.detached.verify(
      base64ToUint8Array(challenge),
      base64ToUint8Array(signature),
      base64ToUint8Array(publicKey)
    );
  }
}
