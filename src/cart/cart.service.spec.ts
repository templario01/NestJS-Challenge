import { Cart, Product, User } from '.prisma/client';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let prisma: PrismaService;
  let product1: Product;
  let product2: Product;
  let user: User;
  let cart: Cart;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [CartService],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.createMany({
      data: [
        { name: 'category1' },
        { name: 'category2' },
        { name: 'category3' },
        { name: 'category4' },
      ],
    });
    product1 = await prisma.product.create({
      data: {
        active: true,
        name: 'Product 2',
        price: 20,
        stock: 20,
        category: {
          connect: [{ name: 'category2' }, { name: 'category3' }],
        },
      },
    });
    product2 = await prisma.product.create({
      data: {
        active: true,
        name: 'Product 3',
        price: 30,
        stock: 50,
        category: {
          connect: [{ name: 'category1' }, { name: 'category4' }],
        },
      },
    });
    user = await prisma.user.create({
      include: {
        cart: true,
      },
      data: {
        email: 'joelvaldezangeles@gmail.com',
        password: '123456',
        name: 'Joel Valdez',
        role: 'user',
        veryfiedAt: new Date(),
        cart: {
          create: {},
        },
      },
    });
    cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('addToCart', () => {
    it('should add a product to a cart', async () => {
      const updatedCart = await service.addToCart(product1.uuid, cart.uuid, 1);
      expect(updatedCart.products.length).toBe(1);
    });
    it("should throw product doesn't exists", async () => {
      try {
        await service.addToCart('', cart.uuid, 1);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe("Product doesn't exists");
      }
    });
    it('should throw insuficient stock', async () => {
      try {
        await service.addToCart(product2.uuid, cart.uuid, 51);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Insufficient stock');
      }
    });
  });
  describe('removeFromCart', () => {
    it('should remove the product from the cart', async () => {
      await service.addToCart(product1.uuid, cart.uuid, 1);
      const updatedCart = await service.removeFromCart(
        product1.uuid,
        cart.uuid,
      );
      expect(updatedCart.products.length).toBe(0);
    });
    it('should throw no such product in your cart', async () => {
      try {
        await service.removeFromCart(product1.uuid, cart.uuid);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('No such product in your cart');
      }
    });
  });
  describe('getCart', () => {
    it('should return the cart', async () => {
      const cartResult = await service.getCart(cart.uuid);
      expect(cartResult).toBeDefined();
    });
  });
});
