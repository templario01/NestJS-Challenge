import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AttachmentService } from './attachment.service';
import attachmentConfig from './config/attachment.config';
import { Product } from '.prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let prisma: PrismaService;
  let product: Product;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(attachmentConfig), PrismaModule],
      providers: [AttachmentService],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$connect();
    await prisma.product.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.category.deleteMany();
    await prisma.category.createMany({
      data: [
        { name: 'category1' },
        { name: 'category2' },
        { name: 'category3' },
        { name: 'category4' },
      ],
    });
    product = await prisma.product.create({
      data: {
        name: 'test',
        price: 1,
        active: true,
        stock: 10,
        category: {
          connect: [{ name: 'category1' }, { name: 'category2' }],
        },
      },
    });
    product = await prisma.product.create({
      data: {
        name: 'test2',
        price: 1,
        active: true,
        stock: 10,
        category: {
          connect: [{ name: 'category3' }, { name: 'category4' }],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImages', () => {
    const imgType = 'image/png';
    const badUuid = '99999f4-45gf45g-45g45g4-45g45g4-g45/3';
    it('should return an object with signed url', async () => {
      await expect(
        service.uploadImages(product.uuid, imgType),
      ).resolves.toHaveProperty('signedUrl');
    });
    it('should return uuid not found when set invalid uuid', async () => {
      await expect(service.uploadImages(badUuid, imgType)).rejects.toThrow(
        new NotFoundException(`${badUuid} not found`),
      );
    });
  });
  describe('getImages', () => {
    const badUuid = '99999f4-45gf45g-45g45g4-45g45g4-g45/3';
    it('should return a list with url of images', async () => {
      await expect(service.getImages(product.uuid)).resolves.toBeInstanceOf(
        Array,
      );
    });
    it('should return uuid not found when set invalid uuid', async () => {
      await expect(service.getImages(badUuid)).rejects.toThrow(
        new NotFoundException(`${badUuid} not found`),
      );
    });
  });
});
