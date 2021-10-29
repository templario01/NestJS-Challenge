import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/guards/dto/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}

  getOrders = async (paginationQueryDto: PaginationQueryDto) => {
    const { limit, offset } = paginationQueryDto;
    return await this.prismaService.order.findMany({
      skip: offset,
      take: limit,
    });
  };

  getOrder = async (id: number) => {
    return await this.prismaService.order.findUnique({ where: { id } });
  };

  getMyOrders = async (uuid: string) => {
    const user = await this.prismaService.user.findUnique({
      where: {
        uuid,
      },
    });
    return await this.prismaService.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  };

  createOrder = async (cartUuid: string) => {
    const cartProducts = await this.prismaService.cart.findUnique({
      where: {
        uuid: cartUuid,
      },
      include: {
        products: true,
      },
    });
    const products = cartProducts.products;
    const order = await this.prismaService.order.create({
      data: {
        total: cartProducts.total,
        userId: cartProducts.userId,
        products: {
          createMany: {
            data: products.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
            })),
          },
        },
      },
    });
    await this.prismaService.cart.update({
      where: {
        uuid: cartUuid,
      },
      data: {
        total: 0,
        products: {
          set: [],
        },
      },
    });
    return order;
  };
}
