import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { jwtAuthGuard } from 'src/common/guards/token.guard';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(jwtAuthGuard)
  @Post()
  createOrder(@Request() req) {
    return this.orderService.createOrder(req.user.cartUuid);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Get()
  getOrders() {
    return this.orderService.getOrders();
  }

  @UseGuards(jwtAuthGuard)
  @Get(':id')
  getOrder(@Param() id: number) {
    return this.orderService.getOrder(id);
  }

  @UseGuards(jwtAuthGuard)
  @Get('/me')
  getMyOrders(@Request() req) {
    return this.orderService.getMyOrders(req.user.uuid);
  }
}
