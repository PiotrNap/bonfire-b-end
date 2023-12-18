import { Column, Entity } from "typeorm"
import { BaseEntity } from "./base.entity.js"
import { IsNumberString } from "class-validator"

@Entity()
export class BetaTestersEntity extends BaseEntity {
  @Column({ unique: true, length: 6 })
  @IsNumberString()
  key: string

  @Column()
  redeemed: boolean

  @Column()
  txHashMainnet: string

  @Column()
  txHashTestnet: string
}
