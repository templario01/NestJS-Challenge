import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { jwtAuthGuard } from 'src/common/guards/token.guard';
import { CartService } from './cart.service';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}
  @UseGuards(jwtAuthGuard)
  @Post(':uuid')
  addToCart(
    @Param('uuid') productUuid: string,
    @Request() req,
    @Body() { quantity },
  ) {
    return this.cartService.addToCart(
      productUuid,
      req.user.cartUuid,
      quantity || 1,
    );
  }

  @UseGuards(jwtAuthGuard)
  @Delete(':uuid')
  deleteFromCart(@Param('uuid') productUuid: string, @Request() req) {
    return this.cartService.removeFromCart(productUuid, req.user.cartUuid);
  }

  @UseGuards(jwtAuthGuard)
  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.cartUuid);
  }
}
