import { UserDto } from "../../users/dto/user.dto"

export interface LoginStatus {
  username: string
  id: string
  accessToken: any
  expiresIn: any
}
