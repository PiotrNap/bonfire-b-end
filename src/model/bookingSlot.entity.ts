import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EventEntity } from "./event.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class BookingSlotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => EventEntity, (event: EventEntity) => event.bookedSlots)
  event: EventEntity;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.bookedEvents)
  attendee: UserEntity;

  // duration in milliseconds
  @Column({ type: "int", nullable: false })
  bookedDuration: number;

  @Column({ type: "int", nullable: false })
  bookedDay: number;

  @Column({ type: "int", nullable: false })
  bookedTimeSlot: number;

  // transaction hash (?)
  @Column({ type: "varchar" })
  txHash: string;
}
