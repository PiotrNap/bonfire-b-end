import { messaging } from "firebase-admin"
import { MessagingPayload } from "node_modules/firebase-admin/lib/messaging/messaging-api.js"

export const sendMessageToDevice = async (
  token: string | string[],
  payload: MessagingPayload
) => {
  await messaging().sendToDevice(token, payload, {
    contentAvailable: true,
    priority: "high",
  })
}

export const sendBookedEventMessage = async (
  organizerToken: string | string[],
  attendeeAlias: string,
  eventTitle: string,
  eventId: string
) => {
  await sendMessageToDevice(organizerToken, {
    notification: {
      title: `New Event Booking`,
      message: `Your event '${eventTitle}' was recently booked by ${attendeeAlias}, check out more details.`,
    },
    data: { eventId },
  })
}
