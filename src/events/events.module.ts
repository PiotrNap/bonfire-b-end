import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsGateway } from "./events.gateway";
import { EventsController } from "./events.controller";
import { EventEntity } from "src/model/event.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingSlotEntity } from "src/model/bookingSlot.entity";
import { OrganizerEntity } from "src/model/organizer.entity";
import { AttendeeEntity } from "src/model/attendee.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      OrganizerEntity,
      AttendeeEntity,
      BookingSlotEntity,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsGateway, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
