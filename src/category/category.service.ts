import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll = async () => {
    const query = await this.prismaService.category.findMany();
    return query;
  };

  createCategory = async (createCategoryDto: CreateCategoryDto) => {
    const query = await this.prismaService.category.create({
      data: { name: createCategoryDto.name },
    });
    return query;
  };

  updateCategory = async (id: number, updateCategoryDto: UpdateCategoryDto) => {
    const query = await this.prismaService.category.update({
      where: {
        id: id,
      },
      data: {
        name: updateCategoryDto.name,
      },
    });
    return query;
  };

  deleteCategory = async (id: number) => {
    const query = await this.prismaService.category.delete({
      where: {
        id: id,
      },
    });
    return query;
  };
}
