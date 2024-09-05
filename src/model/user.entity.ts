import { Entity, Column, TableInheritance, OneToMany } from "typeorm"
import { BaseEntity } from "./base.entity.js"
import { BookingSlotEntity } from "./bookingSlot.entity.js"
import { DeviceCredentialEntity } from "./deviceCredential.entity.js"
import { EventEntity } from "./event.entity.js"

@Entity({ name: "user" })
@TableInheritance({ column: { type: "varchar", name: "userType" } })
export class UserEntity extends BaseEntity {
  @Column({
    name: "username",
    type: "varchar",
    nullable: true,
    length: 100,
  })
  username: string

  @Column({
    name: "walletPublicKey",
    type: "varchar",
    nullable: true,
  })
  walletPublicKey: string // public key (hex) derived from user's root key

  @Column({ type: "bytea", nullable: true })
  profileImage: Buffer

  ////TODO when user can use multiple devices, this has to be an array of tokens
  //@Column("varchar", {
  //  name: "messagingToken",
  //  nullable: true,
  //})
  //messagingToken?: string

  // @Column({
  //   name: "googleApiCredentials",
  //   type: "json",
  //   nullable: true,
  // })
  // googleApiCredentials: string

  // @Column({
  //   name: "lastUsedRefreshToken",
  //   type: "timestamptz",
  //   nullable: true,
  // })
  // lastUsedRefreshToken: Date

  @Column("varchar", {
    name: "verificationNonce",
    nullable: true,
  })
  verificationNonce?: string

  @Column({ name: "deepLinkingCallbackUri", type: "varchar", nullable: true })
  deepLinkingCallbackUri?: string

  @Column({ type: "json", nullable: true })
  userSettings?: UserSettings // user profile settings

  @Column({ type: "json", nullable: true })
  baseAddresses: Addresses // mainnet + testnet (PreProd)

  @Column({ name: "bio", type: "varchar", length: 250, nullable: true })
  bio?: string

  @Column({ name: "profession", type: "varchar", length: 100, nullable: true })
  profession?: string | string[]

  @Column({ name: "jobTitle", type: "varchar", length: 100, nullable: true })
  jobTitle?: string | string[]

  @Column({ name: "skills", type: "varchar", length: 100, nullable: true })
  skills?: string | string[]

  @Column({ name: "hourlyRateAda", type: "int", nullable: true })
  hourlyRateAda?: number

  @OneToMany(() => DeviceCredentialEntity, (dc: DeviceCredentialEntity) => dc.userID)
  deviceCredentials: DeviceCredentialEntity[]

  // hosted events (events for sale)
  @OneToMany(() => EventEntity, (event: EventEntity) => event.organizer, {
    cascade: true,
  })
  events: EventEntity[]

  // scheduled events as an attendee
  @OneToMany(
    () => BookingSlotEntity,
    (bookingSlot: BookingSlotEntity) => bookingSlot.attendee
  )
  bookedSlots: BookingSlotEntity[]

  // scheduled events as an organizer
  @OneToMany(
    () => BookingSlotEntity,
    (bookingSlot: BookingSlotEntity) => bookingSlot.organizer
  )
  scheduledSlots: BookingSlotEntity[]
}

export type UserSettings = {
  eventCreationHintHidden: boolean
  showPastCalendarEvents: boolean
}

export type Addresses = {
  mainnet: string
  testnet: string
}

export function isUserEntity(obj: any): obj is UserEntity {
  return (
    obj.name != "undefined" &&
    obj.username !== "undefined" &&
    obj.deviceCredentials !== "undefined"
  )
}
