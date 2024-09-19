import { Injectable } from "@nestjs/common"
import { SubmitFormDto } from "./dto/submitForm-dto.js"
import brevo, { TransactionalEmailsApiApiKeys } from "@getbrevo/brevo"

@Injectable()
export class UploadService {
  async forwardContactFormData(file: Express.Multer.File, formData: SubmitFormDto) {
    const { email: senderEmail, message: senderMessage } = formData

    let apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

    let sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject = `Bonfire - Contact Us - ${senderEmail}`
    sendSmtpEmail.htmlContent = `<html><body><p>${senderMessage}</p></body></html>`
    sendSmtpEmail.sender = { name: "Bonfire guest", email: "piotr.napierala94@gmail.com" }
    sendSmtpEmail.to = [{ email: "bonfire484@gmail.com", name: "Bonfire Team" }]
    sendSmtpEmail.attachment = [
      {
        name: file.originalname,
        content: file.buffer.toString("base64"),
      },
    ]

    return apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: " + JSON.stringify(data))
      },
      function (error) {
        console.error(error)
      }
    )
  }
}
