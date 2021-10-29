import { Cart, Product, User } from '.prisma/client';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { async } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;
  let cartService: CartService;
  let product1: Product;
  let product2: Product;
  let user: User;
  let cart: Cart;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService, PrismaService, CartService],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
    cartService = module.get<CartService>(CartService);
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
    cart = await cartService.addToCart(product1.uuid, cart.uuid, 1);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createOrder', () => {
    it('should create a order', async () => {
      const order = await service.createOrder(cart.uuid);
      expect(order).toBeDefined();
    });
    it('should throw Cart is empty', async () => {
      expect.assertions(2);
      try {
        await service.createOrder(cart.uuid);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Cart is empty');
      }
    });
  });
  describe('getOrders', () => {
    it('should return an array of orders', async () => {
      const orders = await service.getOrders();
      expect(orders).toBeDefined();
      expect(orders.length).toBe(1);
    });
  });
  describe('getOrder', () => {
    it('should return an order', async () => {
      const orders = await service.getOrders();
      const order = await service.getOrder(orders[0].uuid);
      expect(order).toBeDefined();
    });
    it('should throw No Order Found', async () => {
      expect.assertions(2);
      try {
        await service.getOrder('123');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('No Order Found');
      }
    });
  });
  describe('getMyOrders', () => {
    it('should return an array of orders', async () => {
      const orders = await service.getMyOrders(user.uuid);
      expect(orders).toBeDefined();
      expect(orders.length).toBe(1);
    });
  });
});
