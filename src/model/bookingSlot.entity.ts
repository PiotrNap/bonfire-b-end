import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EventEntity } from "./event.entity";

@Entity()
export class BookingSlotEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => EventEntity, (event: EventEntity) => event.bookedSlots)
  event: EventEntity;

  // duration in milliseconds
  @Column({ type: "int", nullable: false })
  bookedDuration: number;

  @Column({ type: "int", nullable: false })
  bookedDay: number;

  @Column({ type: "int", nullable: false })
  bookedTimeSlot: number;

  @Column({ type: "varchar", nullable: false })
  attendeeId: string;

  // transaction hash (?)
  @Column({ type: "varchar" })
  txHash: string;
}
