import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryResponseDto } from './dto/category-response-dto';
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
    try {
      const query = await this.prismaService.category.create({
        data: { name: createCategoryDto.name },
      });
      return query;
    } catch (error) {
      throw new BadRequestException('invalid name');
    }
  };

  updateCategory = async (
    uuid: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> => {
    try {
      const query = await this.prismaService.category.update({
        where: {
          uuid: uuid,
        },
        data: {
          name: updateCategoryDto.name,
        },
      });
      return plainToClass(CategoryResponseDto, query);
    } catch (error) {
      console.log(error);
      throw new NotFoundException('id not found');
    }
  };

  deleteCategory = async (uuid: string): Promise<MessageResponseDto> => {
    try {
      await this.prismaService.category.delete({
        where: {
          uuid: uuid,
        },
      });
      return { message: `Category #${uuid} deleted successfull` };
    } catch (error) {
      throw new NotFoundException(`Category #${uuid} not found`);
    }
  };
}
