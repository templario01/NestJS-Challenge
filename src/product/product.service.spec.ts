import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import attachmentConfig from '../attachment/config/attachment.config';
import { AttachmentService } from '../attachment/attachment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from './product.service';
import { PaginationQueryDto } from 'src/common/guards/dto/pagination-query.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Product, User } from '.prisma/client';
import { TypesEnum } from './dto/content-type.dto';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;
  let user: User;
  let product: Product;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(attachmentConfig), PrismaModule],
      providers: [ProductService, AttachmentService],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    user = await prisma.user.create({
      data: { email: 'doe@gmail.com', password: '123456', name: 'juan' },
    });
    await prisma.category.createMany({
      data: [
        { name: 'category1' },
        { name: 'category2' },
        { name: 'category3' },
        { name: 'category4' },
      ],
    });
    product = await service.createProduct({
      name: 'test',
      price: 1,
      active: true,
      stock: 10,
      categoryName: ['category1', 'category2'],
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
      expect(products.length).toBe(2);
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
      expect(products.length).toBe(2);
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
  describe('updateProduct', () => {
    it('should update a product and its categories', async () => {
      const product = await service.createProduct({
        name: 'test',
        price: 1,
        active: true,
        stock: 10,
        categoryName: ['category1', 'category2'],
      });
      const updatedProduct = await service.updateProductAndCategories(
        product.uuid,
        {
          name: 'test2',
          price: 2,
          active: false,
          stock: 20,
          categoryName: ['category3', 'category4'],
        },
      );
      expect(updatedProduct.name).toBe('test2');
      expect(updatedProduct.active).toBe(false);
      expect(updatedProduct.stock).toBe(20);
      expect(updatedProduct.category[0].name).toEqual('category3');
      expect(updatedProduct.category[1].name).toEqual('category4');
    });
    it('should only update the product', async () => {
      const product = await service.createProduct({
        name: 'test',
        price: 1,
        active: true,
        stock: 10,
        categoryName: ['category1', 'category2'],
      });
      const updatedProduct = await service.updateProductAndCategories(
        product.uuid,
        {
          name: 'test2',
        },
      );
      expect(updatedProduct.name).toBe('test2');
      expect(updatedProduct.active).toBe(true);
      expect(updatedProduct.stock).toBe(10);
      expect(updatedProduct.category[0].name).toEqual('category1');
      expect(updatedProduct.category[1].name).toEqual('category2');
    });
  });

  describe('deleteProduct', () => {
    it('should delete the product', async () => {
      const product = await service.createProduct({
        name: 'test',
        price: 1,
        active: true,
        stock: 10,
        categoryName: ['category1', 'category2'],
      });
      const productDeleted = await service.deleteProduct(product.uuid);
      expect(productDeleted.content).toMatch(
        `Product #${product.uuid} deleted successfull`,
      );
    });
    it('should throw Product not found', async () => {
      expect.assertions(2);
      try {
        await service.deleteProduct('not-found');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(`Product #not-found not found`);
      }
    });
  });

  describe('setLike', () => {
    it('should set like', async () => {
      const productUpdated = await service.setLike(product.uuid, user.uuid);
      expect(productUpdated.likes).toBe(1);
    });
    it('should throw user already have like in product', async () => {
      expect.assertions(2);
      try {
        await service.setLike(product.uuid, user.uuid);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe(
          `User #${user.uuid} already have Like in product #${product.uuid}`,
        );
      }
    });
  });

  describe('deleteLike', () => {
    it('should delete like', async () => {
      const productUpdated = await service.deleteLike(product.uuid, user.uuid);
      expect(productUpdated.likes).toBe(0);
    });
    it('should throw like not found', async () => {
      expect.assertions(2);
      try {
        await service.deleteLike(product.uuid, user.uuid);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(
          `User #${user.uuid} not have Like in product #${product.uuid}`,
        );
      }
    });
  });
  describe('uploadImagesToProduct', () => {
    it('should reuturn a signed url', async () => {
      const product = await service.createProduct({
        name: 'test',
        price: 1,
        active: true,
        stock: 10,
        categoryName: ['category1', 'category2'],
      });
      const productUpdated = await service.uploadImagesToProduct(product.uuid, {
        contentType: TypesEnum.IMAGEJPEG,
      });
      expect(productUpdated.contentType).toBe('image/jpeg');
    });
    it('should throw Product not found', async () => {
      expect.assertions(2);
      try {
        await service.uploadImagesToProduct('not-found', {
          contentType: TypesEnum.IMAGEJPEG,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(`Product #not-found not found`);
      }
    });
  });
});
