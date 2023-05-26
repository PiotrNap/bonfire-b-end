import { HourlyRate } from "src/common/lib/types"

export interface LoginStatus {
  username: string
  id: string
  accessToken: any
  expiresIn: any
  profileImage: any
  hourlyRate: HourlyRate
  timeZone: any
}
