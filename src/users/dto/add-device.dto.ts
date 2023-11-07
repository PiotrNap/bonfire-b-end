import { IsNotEmpty } from "class-validator"

export class AddDeviceDTO {
  @IsNotEmpty({ message: "Devices public key cannot be empty" })
  devicePubKey: string

  @IsNotEmpty({ message: "Wallet pubKey message cannot be empty" })
  walletPublicKey: string // account #0 pubKey, proves that user knows the mnemonic
}
