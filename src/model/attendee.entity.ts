import { ChildEntity, OneToMany } from "typeorm"
import { BookingSlotEntity } from "./bookingSlot.entity"
import { UserEntity } from "./user.entity"

@ChildEntity()
export class AttendeeEntity extends UserEntity {
  // scheduled events as an attendee
  @OneToMany(
    () => BookingSlotEntity,
    (bookingSlot: BookingSlotEntity) => bookingSlot.attendee
  )
  bookedSlots: BookingSlotEntity[]
}
