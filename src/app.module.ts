import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtService } from './common/services/jwt/jwt.service';
import { SendgridService } from './common/services/sendgrid/sendgrid.service';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './common/common.module';
import { ImageRepositoryService } from './repositories/image-repository/image-repository.service';
import { ImageRepositoryModule } from './repositories/image-repository/image-repository.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ProductModule,
    CategoryModule,
    CommonModule,
    CartModule
    ImageRepositoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, SendgridService, ImageRepositoryService],
})
export class AppModule {}
