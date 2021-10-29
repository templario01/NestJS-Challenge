import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [CategoryService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
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
    const category = await prisma.category.findUnique({
      where: {
        name: 'category1',
      },
    });

    await expect(
      service.updateCategory(category.uuid, { name: 'nuevo' }),
    ).resolves.toEqual({
      id: expect.any(Number),
      uuid: expect.any(String),
      name: 'nuevo',
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
    const category = await prisma.category.findUnique({
      where: {
        name: 'category3',
      },
    });
    await expect(service.deleteCategory(category.uuid)).resolves.toMatchObject(
      category,
    );
  });

  it('should throw error when id do not exist', async () => {
    const uuid = '34534t34f-5g45g-5g45-556h56h65-43t4f';
    await expect(service.deleteCategory(uuid)).rejects.toThrow(
      new NotFoundException(`Category #${uuid} not found`),
    );
  });
});
