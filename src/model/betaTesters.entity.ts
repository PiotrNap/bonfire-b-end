import { Column, Entity } from "typeorm"
import { BaseEntity } from "./base.entity.js"
import { IsNumberString } from "class-validator"

@Entity()
export class BetaTestersEntity extends BaseEntity {
  @Column({ unique: true, length: 6 })
  @IsNumberString()
  key: string

  @Column({ nullable: true })
  userId: string

  @Column()
  redeemed: boolean

  @Column({ nullable: true })
  txHash: string
}
