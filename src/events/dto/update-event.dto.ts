import { PartialType } from "@nestjs/mapped-types"
import { IsUUID } from "class-validator"
import { CreateEventDto } from "./create-event.dto.js"

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsUUID()
  id: string
}
