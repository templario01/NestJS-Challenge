import { OrderResponseDto } from '../../order/dto/response-order.dto';
import { plainToClass } from 'class-transformer';
import { OrderProductDto } from '../../order/dto/order-product.dto';
import { ProductResponseDto } from '../../product/dto/product-response.dto';
import { CartProductDto } from 'src/cart/dto/cart-product.dto';
import { CartResponseDto } from 'src/cart/dto/cart-response.dto';

export const transformOrders = (orders): OrderResponseDto[] => {
  return orders.map((order) =>
    plainToClass(OrderResponseDto, {
      ...order,
      total: order.total.toNumber(),
      products: order.products.map((product) =>
        plainToClass(OrderProductDto, {
          ...product,
          product: plainToClass(ProductResponseDto, {
            ...product.product,
            price: product.product.price.toNumber(),
          }),
        }),
      ),
    }),
  );
};
export const transformOrder = (order): OrderResponseDto => {
  return plainToClass(OrderResponseDto, {
    ...order,
    total: order.total.toNumber(),
    products: order.products.map((product) =>
      plainToClass(OrderProductDto, {
        ...product,
        product: plainToClass(ProductResponseDto, {
          ...product.product,
          price: product.product.price.toNumber(),
        }),
      }),
    ),
  });
};

export const transformCart = (cart): CartResponseDto => {
  return plainToClass(CartResponseDto, {
    ...cart,
    total: cart.total.toNumber(),
    products: cart.products.map((product) =>
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
