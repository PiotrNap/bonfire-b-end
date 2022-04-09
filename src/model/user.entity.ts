import { Entity, Column, TableInheritance } from "typeorm"
import { BaseEntity } from "./base.entity"

@Entity({ name: "user" })
@TableInheritance({ column: { type: "varchar", name: "userType" } })
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 100, nullable: true })
  name: string // real name

  @Column({ type: "bytea", nullable: true })
  profileImage: Buffer //base encoded image 512x512

  // @Column({ type: "varchar", length: 65535 })
  // didDocument?: string; // reference to did-document

  @Column({
    name: "username",
    type: "varchar",
    nullable: true,
    length: 100,
  })
  username: string

  @Column({
    name: "publicKey",
    type: "varchar",
    nullable: false,
  })
  publicKey: string

  @Column({
    name: "googleApiCredentials",
    type: "json",
    nullable: true,
  })
  googleApiCredentials: string

  @Column({
    name: "lastUsedRefreshToken",
    type: "timestamptz",
    nullable: true,
  })
  lastUsedRefreshToken: Date

  @Column("varchar", {
    name: "verificationNonce",
    nullable: true,
  })
  verificationNonce?: string

  @Column({ name: "profileType", type: "varchar", nullable: true })
  profileType: "organizer" | "attendee"

  @Column({ name: "deepLinkingCallbackUri", type: "varchar", nullable: true })
  deepLinkingCallbackUri: string

  // @Column({ type: 'varchar', length: 65535 })
  // profileSettings?: string; // profile settings
}

export function isUserEntity(obj: any): obj is UserEntity {
  return (
    obj.name != "undefined" &&
    obj.username !== "undefined" &&
    obj.publicKey !== "undefined"
  )
}
