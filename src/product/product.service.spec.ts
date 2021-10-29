import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import attachmentConfig from '../attachment/config/attachment.config';
import { AttachmentService } from '../attachment/attachment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from './product.service';
import { PaginationQueryDto } from 'src/common/guards/dto/pagination-query.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(attachmentConfig)],
      providers: [ProductService, PrismaService, AttachmentService],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.category.createMany({
      data: [
        { name: 'category1' },
        { name: 'category2' },
        { name: 'category3' },
        { name: 'category4' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const product = await service.createProduct({
        name: 'test',
        price: 1,
        active: true,
        stock: 10,
        categoryName: ['category1', 'category2'],
      });
      expect(product).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should get all products', async () => {
      const products = await service.findAll({} as PaginationQueryDto);
      expect(products).toBeDefined();
      expect(products.length).toBe(1);
    });
  });

  describe('findByCategory', () => {
    it('should get all products by category', async () => {
      expect.assertions(2);
      const category = await prisma.category.findUnique({
        where: { name: 'category1' },
      });
      const products = await service.findByCategory(category.uuid);
      expect(products).toBeDefined();
      expect(products.length).toBe(1);
    });

    it('should throw Category not found', async () => {
      expect.assertions(2);
      try {
        await service.findByCategory('not-found');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe('Category not found');
      }
    });
  });

  describe('findByUuid', () => {
    it('should get a product by uuid', async () => {
      const productCreated = await service.createProduct({
        name: 'test2',
        price: 1,
        active: true,
        stock: 10,
        categoryName: ['category3', 'category4'],
      });
      const product = await service.findProduct(productCreated.uuid);
      expect(product.name).toBe(productCreated.name);
    });

    it('should throw Product not found', async () => {
      expect.assertions(2);
      try {
        await service.findProduct('not-found');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(`Product #not-found not found`);
      }
    });
  });

  describe('verifyCategories', () => {
    it('should throw Category #category5 not found', async () => {
      expect.assertions(2);
      try {
        await service.createProduct({
          name: 'test',
          price: 1,
          active: true,
          stock: 10,
          categoryName: ['category1', 'category2', 'category5'],
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Category #category5 not found');
      }
    });
  });
});
