import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttachmentService } from '../attachment/attachment.service';
import attachmentConfig from '../attachment/config/attachment.config';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductController } from './product.controller';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule, ConfigModule.forFeature(attachmentConfig)],
  providers: [ProductService, AttachmentService, ProductResolver],
  controllers: [ProductController],
})
export class ProductModule {}
