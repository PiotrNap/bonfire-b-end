import { UserEntity } from "../model/user.entity";
import { UserDto } from "../users/dto/user.dto";

export const toUserDto = (data: UserEntity): UserDto => {
  const { id, username, publicKey, profileType } = data;

  let userDto: UserDto = {
    id,
    username,
    publicKey,
    profileType,
  };

  return userDto;
};
