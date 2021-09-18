import { IsNotEmpty, IsString } from "class-validator";
import { UserEntity } from "src/model/user.entity";
import { base64ToUint8Array, base64ToUTF8 } from "src/common/utils";
import { sha256 } from "js-sha256";
import * as nacl from "tweetnacl";

export class ChallengeResponseDTO {
  public validate(
    user: UserEntity,
    signature: string,
    challenge: string
  ): boolean {
    var { id, publicKey } = user;
    var TTL = 30000; // time to live 30 seconds

    var challArray = base64ToUTF8(challenge).split("_");
    var [challengeUUID, challengeTime, challengeHash] = challArray;

    var passedTime = new Date().getTime() - Number(challengeTime);
    var newHash = sha256(
      challengeUUID + challengeTime + process.env.JWT_SECRET
    );

    if (challengeUUID !== id || passedTime > TTL || challengeHash !== newHash)
      return false;

    // challenge hasn't been changed and the 30 sec time span hasn't been reached
    return nacl.sign.detached.verify(
      base64ToUint8Array(challenge),
      base64ToUint8Array(signature),
      base64ToUint8Array(publicKey)
    );
  }

  @IsNotEmpty({ message: "Id cannot be empty" })
  @IsString({ message: "Id must be a string" })
  id: string;

  @IsNotEmpty({ message: "Jwt cannot be empty" })
  @IsString({ message: "Jwt must be a string" })
  jwt: string;

  @IsNotEmpty({ message: "Public key cannot be empty" })
  @IsString({ message: "Public key must be a string" })
  publicKey: string;

  /**
   * Possible null values
   */
  username?: string;
}
