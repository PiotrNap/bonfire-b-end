import { Test, TestingModule } from "@nestjs/testing"
import { IdTokenController } from "./id-token.controller"
import { IdTokenService } from "./id-token.service"

describe("IdTokenController", () => {
  let controller: IdTokenController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdTokenController],
      providers: [IdTokenService],
    }).compile()

    controller = module.get<IdTokenController>(IdTokenController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
