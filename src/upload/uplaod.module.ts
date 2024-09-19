import { Module } from "@nestjs/common"
import { UploadService } from "./upload.service.js"
import { UploadController } from "./upload.controller.js"

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
