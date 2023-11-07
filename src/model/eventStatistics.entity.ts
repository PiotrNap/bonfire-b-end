import { Column, Entity } from "typeorm"
import { BaseEntity } from "./base.entity.js"

@Entity("event-statistics")
export class EventStatistics extends BaseEntity {
  @Column({ name: "likes", type: "bigint" })
  likes: number = 0

  @Column({ name: "views", type: "bigint" })
  views: number = 0
}
