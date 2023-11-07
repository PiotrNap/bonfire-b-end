import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Relation } from "typeorm/index.js"
import { BaseEntity } from "./base.entity.js"
import { UserEntity } from "./user.entity.js"

@Entity({ name: "device-credentials" })
export class DeviceCredentialEntity extends BaseEntity {
  @Column("uuid")
  userID: string

  @Column("varchar")
  publicKey: string

  @Column("varchar", { nullable: true })
  messagingToken: string

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.deviceCredentials)
  user: Relation<UserEntity>
}
