import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { UploadService } from "./upload.service.js"
import { FileInterceptor } from "@nestjs/platform-express"
import { SubmitFormDto } from "./dto/submitForm-dto.js"
import { Public } from "../common/decorators/public.decorator.js"

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post("contact-form")
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor("file"))
  async contactForm(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SubmitFormDto
  ) {
    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Only image files are allowed.")
    }
    return await this.uploadService.forwardContactFormData(file, body)
  }
}
