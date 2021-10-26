import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll = async () => {
    const query = await this.prismaService.product.findMany({
      select: {
        id: true,
        uuid: true,
        stock: true,
        price: true,
        active: true,
        name: true,
        category: { select: { name: true } },
      },
    });
    return query;
  };

  findProduct = async (id: number) => {
    try {
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
    } catch (error) {
      throw new NotFoundException(`Product #${id} not found`);
    }
  };

  createProduct = async (createProductDto: CreateProductDto) => {
    const categories = await this.prismaService.category.findMany({
      where: {
        name: { in: createProductDto.categoryName },
      },
    });

    const categoriesMap = categories.map((c) => c.name);

    createProductDto.categoryName.forEach((name) => {
      if (!categoriesMap.includes(name)) {
        throw new BadRequestException(`Category #${name} not found`);
      }
    });

    const query = await this.prismaService.product.create({
      data: {
        name: createProductDto.name,
        stock: createProductDto.stock,
        price: createProductDto.price,
        active: createProductDto.active,
        category: {
          connect: createProductDto.categoryName.map((c) => ({ name: c })),
        },
      },
      include: { category: { select: { name: true } } },
    });
    return query;
  };

  deleteProduct = async (id: number) => {
    try {
      await this.prismaService.product.delete({
        where: {
          id: id,
        },
      });
      return { content: `Product #${id} deleted successfull` };
    } catch (error) {
      throw new NotFoundException(`Product #${id} not found`);
    }
  };
  // createProduct = async (createProductDto: CreateProductDto) => {
  //   createProductDto.categoryName.forEach((categoryName) => {
  //     (async () => {
  //       try {
  //         await this.prismaService.product.create({
  //           data: {
  //             name: createProductDto.name,
  //             stock: createProductDto.stock,
  //             price: createProductDto.price,
  //             active: createProductDto.active,
  //             category: {
  //               connect: {
  //                 name: categoryName,
  //               },
  //             },
  //           },
  //         });
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     })();
  //   });
  // };
}
