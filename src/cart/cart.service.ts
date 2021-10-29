import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { CartProductDto } from './dto/cart-product.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}
  addToCart = async (
    productUuid: string,
    uuid: string,
    quantity: number,
  ): Promise<CartResponseDto> => {
    let product;
    try {
      product = await this.prismaService.product.findUnique({
        where: { uuid: productUuid },
        rejectOnNotFound: false,
      });
    } catch (e) {
      throw new BadRequestException("Product doesn't exists");
    }
    if (quantity > product.stock) {
      throw new BadRequestException('Insufficient stock');
    }
    await this.prismaService.product.update({
      where: {
        uuid: productUuid,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
    const updatedCart = await this.prismaService.cart.update({
      include: {
        products: {
          include: { product: true },
        },
      },
      data: {
        total: {
          increment: product.price.toNumber() * quantity,
        },
        products: {
          upsert: {
            where: {
              productId: product.id,
            },
            update: {
              quantity: {
                increment: quantity,
              },
            },
            create: {
              quantity,
              productId: product.id,
            },
          },
        },
      },
      where: {
        uuid,
      },
    });
    return plainToClass(CartResponseDto, {
      ...updatedCart,
      total: updatedCart.total.toNumber(),
      products: updatedCart.products.map((product) =>
        plainToClass(CartProductDto, {
          ...product,
          product: plainToClass(CartProductDto, {
            ...product.product,
            price: product.product.price.toNumber(),
          }),
        }),
      ),
    });
  };

  removeFromCart = async (productUuid: string, uuid: string) => {
    const productInCart = await this.prismaService.cart.findFirst({
      include: {
        products: {
          include: {
            product: true,
          },
          where: {
            product: {
              uuid: productUuid,
            },
          },
        },
      },
      where: {
        uuid,
        products: {
          some: {
            product: {
              uuid: productUuid,
            },
          },
        },
      },
    });
    if (!productInCart) {
      throw new BadRequestException('No such product in your cart');
    }
    await this.prismaService.product.update({
      where: {
        uuid: productUuid,
      },
      data: {
        stock: {
          increment: productInCart.products[0].quantity,
        },
      },
    });
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
            productId: productInCart.products[0].product.id,
          },
        },
      },
      include: {
        products: true,
      },
    });
    return cartUpdated;
  };

  getCart = async (uuid: string) => {
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
