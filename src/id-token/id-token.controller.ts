import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common"
import { IdTokenService } from "./id-token.service"
import { CreateIdTokenDto } from "./dto/create-id-token.dto"
import { UpdateIdTokenDto } from "./dto/update-id-token.dto"

@Controller("id-token")
export class IdTokenController {
  constructor(private readonly idTokenService: IdTokenService) {}

  @Post()
  create(@Body() createIdTokenDto: CreateIdTokenDto) {
    return this.idTokenService.create(createIdTokenDto)
  }

  @Get()
  findAll() {
    return this.idTokenService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.idTokenService.findOne(+id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateIdTokenDto: UpdateIdTokenDto) {
    return this.idTokenService.update(+id, updateIdTokenDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.idTokenService.remove(+id)
  }
}
