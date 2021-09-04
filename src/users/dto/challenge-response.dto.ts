import { IsNotEmpty } from "class-validator";
import { UserEntity } from "src/model/user.entity";
import { base64ToUint8Array } from "src/common/utils";
import nacl from "tweetnacl";

export class ChallengeResponseDTO {
  validate(user: UserEntity, signature: string, challenge: string): boolean {
    // var { currChallenge, publicKey } = user;
    // var currChallengeArr: string[] = currChallenge.split("-");
    // var TTL = 30000; // time to live 30 seconds
    // var passedTime = new Date().getTime() - Number(currChallengeArr[1]);

    // // challenge hasn't been changed and the 30 sec time span hasn't been reached
    // if (challenge === currChallenge && passedTime < TTL) {
    //   return nacl.sign.detached.verify(
    //     base64ToUint8Array(challenge),
    //     base64ToUint8Array(signature),
    //     base64ToUint8Array(publicKey)
    //   );
    // }
    // return false;
    return true;
  }

  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  jwt: string;
  @IsNotEmpty()
  publicKey: string;

  /**
   * Possible null values
   */
  username?: string;
}
