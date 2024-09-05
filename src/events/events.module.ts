import { Module } from "@nestjs/common"
import { EventsService } from "./events.service.js"
import { EventsController } from "./events.controller.js"
import { EventEntity } from "../model/event.entity.js"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BookingSlotEntity } from "../model/bookingSlot.entity.js"
import { UserEntity } from "../model/user.entity.js"
import { EventStatistics } from "../model/eventStatistics.entity.js"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      UserEntity,
      BookingSlotEntity,
      EventStatistics,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
