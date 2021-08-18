import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, } from 'class-validator';
import { UserEntity } from '../model/user.entity';

export class UserDTO implements Readonly<UserDTO> {
  @ApiProperty({ required: true })
  @IsUUID()
  id: string;


  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  description: string;

  public static from(dto: Partial<UserDTO>) {
    const it = new UserDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.description = dto.description;
    return it;
  }

  public static fromEntity(entity: UserEntity) {
    return this.from({
      id: entity.id,
      name: entity.name
    });
  }

  public toEntity(user: UserEntity = null) {
    const it = new UserEntity();
    it.id = this.id;
    it.name = this.name;
    //it.description = this.description;
    it.createDateTime = new Date();
    it.createdBy = user ? user.id : null;
    it.lastChangedBy = user ? user.id : null;
    return it;
  }
}