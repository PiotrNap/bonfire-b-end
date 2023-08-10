import { Entity, Column, TableInheritance, OneToMany } from "typeorm"
import { BaseEntity } from "./base.entity"
import { EventEntity } from "./event.entity"
import { BookingSlotEntity } from "./bookingSlot.entity"

@Entity({ name: "user" })
@TableInheritance({ column: { type: "varchar", name: "userType" } })
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 100, nullable: true })
  name: string // real name

  @Column({ type: "bytea", nullable: true })
  profileImage: Buffer

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

  //TODO when user can use multiple devices, this has to be an array of tokens
  @Column("varchar", {
    name: "messagingToken",
    nullable: true,
  })
  messagingToken?: string

  @Column({ name: "profileType", type: "varchar", nullable: true })
  profileType: "organizer" | "attendee"

  @Column({ name: "deepLinkingCallbackUri", type: "varchar", nullable: true })
  deepLinkingCallbackUri: string

  @Column({ type: "json", nullable: true })
  userSettings?: UserSettings // user profile settings

  @Column({ type: "varchar", nullable: true })
  timeZone?: string

  @Column({ type: "json", nullable: true })
  walletBaseAddress?: string

  @Column({ name: "bio", type: "varchar", length: 250, nullable: true })
  bio: string

  @Column({ name: "profession", type: "varchar", length: 100, nullable: true })
  profession?: string | string[]

  @Column({ name: "jobTitle", type: "varchar", length: 100, nullable: true })
  jobTitle?: string | string[]

  @Column({ name: "skills", type: "varchar", length: 100, nullable: true })
  skills?: string | string[]

  @Column({ name: "hourlyRateAda", type: "int", nullable: true })
  hourlyRateAda: number

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

export function isUserEntity(obj: any): obj is UserEntity {
  return (
    obj.name != "undefined" &&
    obj.username !== "undefined" &&
    obj.publicKey !== "undefined"
  )
}
