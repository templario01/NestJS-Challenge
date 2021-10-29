import { PaginationQueryDto } from 'src/common/guards/dto/pagination-query.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderResponseDto } from './dto/response-order.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}

  getOrders = async (paginationQueryDto: PaginationQueryDto) => {
    const { limit, offset } = paginationQueryDto;
    const orders = await this.prismaService.order.findMany({
      skip: offset,
      take: limit,
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    return orders.map((order) =>
      plainToClass(OrderResponseDto, {
        ...order,
        total: order.total.toNumber(),
        products: order.products.map((product) =>
          plainToClass(OrderResponseDto, {
            ...product,
            product: plainToClass(OrderResponseDto, {
              ...product.product,
              price: product.product.price.toNumber(),
            }),
          }),
        ),
      }),
    );
  };

  getOrder = async (uuid: string) => {
    try {
      const order = await this.prismaService.order.findUnique({
        where: { uuid },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });
      return plainToClass(OrderResponseDto, {
        ...order,
        total: order.total.toNumber(),
        products: order.products.map((product) =>
          plainToClass(OrderResponseDto, {
            ...product,
            product: plainToClass(OrderResponseDto, {
              ...product.product,
              price: product.product.price.toNumber(),
            }),
          }),
        ),
      });
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
    const orders = await this.prismaService.order.findMany({
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

    return orders.map((order) =>
      plainToClass(OrderResponseDto, {
        ...order,
        total: order.total.toNumber(),
        products: order.products.map((product) =>
          plainToClass(OrderResponseDto, {
            ...product,
            product: plainToClass(OrderResponseDto, {
              ...product.product,
              price: product.product.price.toNumber(),
            }),
          }),
        ),
      }),
    );
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
      include: {
        products: {
          include: {
            product: true,
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
    return plainToClass(OrderResponseDto, {
      ...order,
      total: order.total.toNumber(),
      products: order.products.map((product) =>
        plainToClass(OrderResponseDto, {
          ...product,
          product: plainToClass(OrderResponseDto, {
            ...product.product,
            price: product.product.price.toNumber(),
          }),
        }),
      ),
    });
  };
}
