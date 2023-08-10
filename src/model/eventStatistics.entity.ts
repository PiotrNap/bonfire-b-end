import { Column, Entity } from "typeorm"
import { BaseEntity } from "./base.entity"

@Entity("event-statistics")
export class EventStatistics extends BaseEntity {
  @Column({ name: "event-id", type: "uuid" })
  eventId: string

  @Column({ name: "likes", type: "bigint" })
  likes: number = 0

  @Column({ name: "views", type: "bigint" })
  views: number = 0
}
