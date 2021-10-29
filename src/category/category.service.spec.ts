import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from './category.service';

const prisma = new PrismaService();

beforeEach(async () => {
  await prisma.$connect();
  await prisma.category.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, PrismaService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new category', async () => {
    const cat = {
      name: 'categorietest',
    };
    await expect(service.createCategory(cat)).resolves.toEqual({
      id: expect.any(Number),
      uuid: expect.any(String),
      name: cat.name,
    });
  });

  it('should throw error when name is not valid', async () => {
    const cat = {
      name: 'categorietesttomanytextooooooo',
    };
    await expect(service.createCategory(cat)).rejects.toThrow(
      new BadRequestException('invalid name'),
    );
  });

  it('should update a category', async () => {
    const data = {
      category: { name: 'newname' },
      mockUUid: '3242342-24-234-2',
    };

    await expect(
      service.updateCategory(data.mockUUid, data.category),
    ).resolves.toEqual({
      id: expect.any(Number),
      uuid: expect.any(String),
      name: data.category.name,
    });
  });

  it('should throw an error when new name is not valid', async () => {
    const data = {
      category: { name: 'newnametolargeeeeeeeeeeeee' },
      mockUuid: '2342344f-f43f4f-4f3f',
    };

    await expect(
      service.updateCategory(data.mockUuid, data.category),
    ).rejects.toThrow(new NotFoundException('id not found'));
  });

  it('should delete an category', async () => {
    const uuid = '34534t34f-5g45g-5g45';
    await expect(service.deleteCategory(uuid)).resolves.toEqual([]);
  });

  it('should throw error when id do not exist', async () => {
    const uuid = '34534t34f-5g45g-5g45-556h56h65-43t4f';
    await expect(service.deleteCategory(uuid)).rejects.toThrow(
      new NotFoundException(`Category #${uuid} not found`),
    );
  });
});
