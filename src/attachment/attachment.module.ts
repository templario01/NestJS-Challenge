import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttachmentService } from './attachment.service';
import attachmentConfig from './config/attachment.config';

@Module({
  imports: [ConfigModule.forFeature(attachmentConfig)],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
