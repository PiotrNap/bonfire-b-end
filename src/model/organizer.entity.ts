import { ChildEntity, Column } from "typeorm";
import { UserEntity } from "./user.entity";

@ChildEntity()
export class OrganizerEntity extends UserEntity {}
