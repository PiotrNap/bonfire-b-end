import { UnauthorizedException } from "@nestjs/common"
import { sha256 } from "js-sha256"
import { Random } from "../common/utils"

export const generateSecretState = (id: string): any => {
  const nonce = new Random().generateRandomString(20)
  return {
    nonce,
    state: `${sha256(nonce + id)}_${id}`,
  }
}

export const validateSecretState = (
  hash: string,
  userId: string,
  verificationNonce: string
): boolean => {
  const testHash = sha256(verificationNonce + userId)

  if (String(hash) === String(testHash)) {
    return true
  } else {
    return false
  }
}

export const checkIfAuthorized = (userId: string, id: string) => {
  if (userId !== id) throw new UnauthorizedException()
  return true
}
