import { Entity, Column, TableInheritance, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BookingSlotEntity } from "./bookingSlot.entity";
import { EventEntity } from "./event.entity";

@Entity({ name: "user" })
@TableInheritance({ column: { type: "varchar", name: "userType" } })
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 100, nullable: true })
  name?: string; // real name

  @Column({ type: "varchar", length: 65535, nullable: true })
  profileImage?: string; //base encoded png 512x512

  // @Column({ type: "varchar", length: 65535 })
  // didDocument?: string; // reference to did-document

  @Column({
    name: "username",
    type: "varchar",
    nullable: true,
    length: 100,
  })
  username: string;

  @Column({
    name: "publicKey",
    type: "varchar",
    nullable: false,
  })
  publicKey: string;

  @Column({
    name: "calendarToken",
    type: "varchar",
    nullable: true,
  })
  calendarToken?: string;

  @Column({
    name: "refreshToken",
    type: "varchar",
    nullable: true,
  })
  refreshToken?: string;

  @Column({ name: "id", type: "varchar", nullable: false })
  id: string;

  @Column({ name: "profileType", type: "varchar", nullable: true })
  profileType: string;

  /**
   * Organizer specific
   */
  @Column({ name: "bio", type: "varchar", length: 250, nullable: true })
  bio?: string;

  @Column({ name: "profession", type: "varchar", length: 100, nullable: true })
  profession?: string | string[];

  @Column({ name: "jobTitle", type: "varchar", length: 100, nullable: true })
  jobTitle?: string | string[];

  @Column({ name: "skills", type: "varchar", length: 100, nullable: true })
  skills?: string | string[];

  @Column({ name: "hourlyRate", type: "integer", nullable: true })
  hourlyRate?: number | null;

  @Column({ type: "simple-array", nullable: true })
  tags?: string[] | null;

  /**
   * Organizer should be able to fetch events that he's hosting,
   * and see how many attendees are registered for those events.
   */

  // hosted events (events for sale)
  @OneToMany(() => EventEntity, (event: EventEntity) => event.organizer)
  events: EventEntity[];

  // scheduled events (as an attendee)
  @OneToMany(
    () => BookingSlotEntity,
    (bookingSlot: BookingSlotEntity) => bookingSlot.event,
    {
      cascade: true,
    }
  )
  bookedEvents: BookingSlotEntity[];

  // @Column({ type: 'varchar', length: 65535 })
  // profileSettings?: string; // profile settings
}
