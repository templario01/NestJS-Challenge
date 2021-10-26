import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll = async () => {
    const query = await this.prismaService.product.findMany();
    return query;
  };

  findProduct = async (id: number) => {
    const query = await this.prismaService.product.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
        stock: true,
        price: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return query;
  };

  createProduct = async (createProductDto: CreateProductDto) => {
    const query = await this.prismaService.product.create({
      data: {
        name: createProductDto.name,
        stock: createProductDto.stock,
        price: createProductDto.price,
        active: createProductDto.active,
        category: {
          connect: {
            id: createProductDto.idCategory,
          },
        },
      },
    });
    return query;
  };
}
