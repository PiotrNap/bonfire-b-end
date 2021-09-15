import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsGateway } from "./events.gateway";
import { EventsController } from "./events.controller";
import { EventEntity } from "src/model/event.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  controllers: [EventsController],
  providers: [EventsGateway, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
