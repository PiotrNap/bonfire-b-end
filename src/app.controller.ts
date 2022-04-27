import { Controller, Get, Req } from "@nestjs/common"
import { AuthService } from "./auth/auth.service"
import { Public } from "./common/decorators/public.decorator"

const currentTime = Math.floor(Date.now())
const validityPeriod = currentTime + 1000 * 60 // equates to a 60s validity period
const validFor = (validityPeriod - currentTime) / 1000
const tokenExpiry = new Date(validityPeriod)

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Public()
  sayHi(@Req() req: any) {
    return "hi!\n"
  }
}
