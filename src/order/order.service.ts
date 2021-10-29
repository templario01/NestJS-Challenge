import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}

  getOrders = async () => {
    return await this.prismaService.order.findMany();
  };

  getOrder = async (uuid: string) => {
    try {
      return await this.prismaService.order.findUnique({ where: { uuid } });
    } catch (e) {
      throw new BadRequestException('No Order Found');
    }
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
    if (products.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
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
          deleteMany: {},
        },
      },
    });
    return order;
  };
}
