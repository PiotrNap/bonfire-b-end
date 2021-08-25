import { Entity, Column, TableInheritance, BeforeInsert } from "typeorm";
import { BaseEntity } from "./base.entity";
import bcrypt from 'bcrypt'
@Entity({ name: "user" })
@TableInheritance({ column: { type: "varchar", name: "userType" } })
export class UserEntity extends BaseEntity {
  // @Column({ type: "varchar", length: 300 })
  // name?: string; // real name

  // @Column({ type: "varchar", length: 300 })
  // handle?: string; // username or alias or "@"

  // @Column({ type: "varchar", length: 65535 })
  // profileImage?: string; //base encoded png 512x512

  // @Column({ type: "varchar", length: 65535 })
  // didDocument?: string; // reference to did-document

  username: string;
  @Column({ 
      type: 'varchar', 
      nullable: false 
  }) 
  password: string;  @Column({ 
      type: 'varchar', 
      nullable: false 
  }) 
  publicKey: string;
  email: string;
  @BeforeInsert()  async hashPassword() {
      this.password = await bcrypt.hash(this.password, 10);  
  }

  // @Column({ type: 'varchar', length: 65535 })
  // profileSettings?: string; // profile settings
}


