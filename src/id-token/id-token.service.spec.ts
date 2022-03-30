import { Test, TestingModule } from "@nestjs/testing"
import { IdTokenService } from "./id-token.service"

describe("IdTokenService", () => {
  let service: IdTokenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdTokenService],
    }).compile()

    service = module.get<IdTokenService>(IdTokenService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
