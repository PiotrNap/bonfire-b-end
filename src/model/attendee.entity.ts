import { ChildEntity } from "typeorm";
import { UserEntity } from "./user.entity";

@ChildEntity()
export class AttendeeEntity extends UserEntity {}
