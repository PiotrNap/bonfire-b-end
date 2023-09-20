import { Injectable } from "@nestjs/common"
import { CreateIdTokenDto } from "./dto/create-id-token.dto.js"
import { UpdateIdTokenDto } from "./dto/update-id-token.dto.js"

@Injectable()
export class IdTokenService {
  create(createIdTokenDto: CreateIdTokenDto) {
    return "This action adds a new idToken"
  }

  findAll() {
    return `This action returns all idToken`
  }

  findOne(id: number) {
    return `This action returns a #${id} idToken`
  }

  update(id: number, updateIdTokenDto: UpdateIdTokenDto) {
    return `This action updates a #${id} idToken`
  }

  remove(id: number) {
    return `This action removes a #${id} idToken`
  }
}
