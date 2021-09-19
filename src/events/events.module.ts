import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsGateway } from "./events.gateway";
import { EventsController } from "./events.controller";
import { EventEntity } from "src/model/event.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/model/user.entity";
import { BookingSlotEntity } from "src/model/bookingSlot.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, UserEntity, BookingSlotEntity]),
  ],
  controllers: [EventsController],
  providers: [EventsGateway, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
