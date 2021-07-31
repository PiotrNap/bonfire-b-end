export type Event = {
  location: string;
  time: string;
};
export class CreateEventDTO {
  id: string;
  event: Event;
}
export class UpdateEventDTO {
  id: string;
  event: Event;
}

export class EventResponseDTO {
  id: string;
  event: Event;
}
