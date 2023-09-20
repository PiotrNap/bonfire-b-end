import { Controller } from "@nestjs/common"

const currentTime = Math.floor(Date.now())
const validityPeriod = currentTime + 1000 * 60 // equates to a 60s validity period
const validFor = (validityPeriod - currentTime) / 1000
const tokenExpiry = new Date(validityPeriod)

@Controller()
export class AppController {}
