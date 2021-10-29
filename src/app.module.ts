import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtService } from './common/services/jwt/jwt.service';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './common/common.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { AttachmentModule } from './attachment/attachment.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ProductModule,
    CategoryModule,
    CommonModule,
    CartModule,
    OrderModule,
    AttachmentModule,
  ],
  providers: [JwtService],
})
export class AppModule {}
