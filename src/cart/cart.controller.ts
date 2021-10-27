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
import { jwtAuthGuard } from 'src/common/guards/token.guard';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}
  @UseGuards(jwtAuthGuard)
  @Post(':id')
  addToCart(
    @Param('id') productId: number,
    @Request() req,
    @Body() { quantity },
  ) {
    return this.cartService.addToCart(
      productId,
      req.user.cartUuid,
      quantity || 1,
    );
  }

  @UseGuards(jwtAuthGuard)
  @Delete(':id')
  deleteFromCart(@Param('id') productId: number, @Request() req) {
    return this.cartService.removeFromCart(productId, req.user.cartUuid);
  }

  @UseGuards(jwtAuthGuard)
  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.cartUuid);
  }
}
