import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { PaginationQueryDto } from 'src/common/guards/dto/pagination-query.dto';
import { jwtAuthGuard } from 'src/common/guards/token.guard';
import { OrderService } from './order.service';

@ApiTags('Order')
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
  getOrders(@Request() paginationQueryDto: PaginationQueryDto) {
    return this.orderService.getOrders(paginationQueryDto);
  }

  @UseGuards(jwtAuthGuard)
  @Get('me')
  getMyOrders(@Request() req) {
    return this.orderService.getMyOrders(req.user.uuid);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Get(':uuid')
  getOrder(@Param() uuid: string) {
    return this.orderService.getOrder(uuid);
  }
}
