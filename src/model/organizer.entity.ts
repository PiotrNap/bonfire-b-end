import { ChildEntity, Column } from 'typeorm';
import { UserEntity } from './user.entity';


@ChildEntity()
export class OrganizerEntity extends UserEntity {

  @Column({ type: 'varchar', length: 65535 })
  bio?: string; // 65535 char limit  
  
}