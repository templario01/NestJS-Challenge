import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttachmentService } from 'src/attachment/attachment.service';
import attachmentConfig from 'src/attachment/config/attachment.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule, ConfigModule.forFeature(attachmentConfig)],
  providers: [ProductService, AttachmentService],
  controllers: [ProductController],
})
export class ProductModule {}
