import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}
  addToCart = async (productId: number, uuid: string, quantity: number) => {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new BadRequestException("product doesn't exits");
    }
    if (quantity > product.stock) {
      throw new BadRequestException('insuficient stock');
    }
    const updatedCart = await this.prismaService.cart.update({
      include: { products: true },
      data: {
        total: {
          increment: product.price.toNumber() * quantity,
        },
        products: {
          upsert: {
            where: {
              productId,
            },
            update: {
              quantity: {
                increment: quantity,
              },
            },
            create: {
              quantity,
              productId,
            },
          },
        },
      },
      where: {
        uuid,
      },
    });
    return updatedCart;
  };

  removeFromCart = async (productId: number, uuid: string) => {
    const productInCart = await this.prismaService.cart.findFirst({
      include: {
        products: {
          include: {
            product: true,
          },
          where: {
            productId,
          },
        },
      },
      where: {
        uuid,
        products: {
          some: {
            productId,
          },
        },
      },
    });
    if (!productInCart) {
      throw new BadRequestException('no such product in your cart');
    }
    const cartUpdated = await this.prismaService.cart.update({
      where: {
        uuid,
      },
      data: {
        total: {
          decrement:
            productInCart.products[0].product.price.toNumber() *
            productInCart.products[0].quantity,
        },
        products: {
          delete: {
            productId,
          },
        },
      },
      include: {
        products: true,
      },
    });
    return cartUpdated;
  };

  getCart = async (uuid) => {
    const cart = await this.prismaService.cart.findUnique({
      where: {
        uuid,
      },
      include: {
        products: true,
      },
    });
    return cart;
  };
}
