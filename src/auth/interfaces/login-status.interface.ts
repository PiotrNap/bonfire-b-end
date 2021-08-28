import { UserDto } from '../../users/dto/user.dto';

export interface LoginStatus {
  username: string;
  accessToken: any;
  expiresIn: any;
}