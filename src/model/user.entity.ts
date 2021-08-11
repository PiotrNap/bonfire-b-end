import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 300 })
  gimbalID: string;
}