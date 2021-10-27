import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

  updateProductAndCategories = async (
    id: number,
    updateProductDto: UpdateProductDto,
  ) => {
    let query = null;
    if (updateProductDto.categoryName.length == 0) {
      // query = this.prismaService.product.update({

      // })
      console.log('hacer consulta');
    }

    const categories = await this.prismaService.category.findMany({
      where: {
        name: { in: updateProductDto.categoryName },
      },
    });

    const categoriesMap = categories.map((c) => c.name);

    updateProductDto.categoryName.forEach((name) => {
      if (!categoriesMap.includes(name)) {
        throw new BadRequestException(`Category #${name} not found`);
      }
    });
    // #2 comparar las categorias nuevas con las existentes
    // y eliminar las que ya no son nuevas
    const newCategoriesProduct = updateProductDto.categoryName;

    // #1 romper conexiones con todas las categorias
    query = await this.prismaService.product.update({
      where: {
        id: id,
      },
      data: {
        category: {
          set: [],
        },
      },
      include: { category: true },
    });

    // #2 asignar las nuevas conexiones con categorias
    await this.prismaService.product.update({
      where: {
        id: id,
      },
      data: {
        category: {
          connect: newCategoriesProduct.map((c) => ({ name: c })),
        },
      },
    });
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

  setLike = async (productId: number, userId: number) => {
    const findLikeId = await this.prismaService.productLike.findMany({
      where: {
        userId: userId,
        productId: productId,
      },
      select: {
        id: true,
      },
    });
    const idSelected = findLikeId[0];
    if (idSelected) {
      throw new ForbiddenException(
        `user #${userId} already have Like in product #${productId}`,
      );
    }

    const query = await this.prismaService.productLike.create({
      data: {
        product: {
          connect: { id: productId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    return query;
  };

  deleteLike = async (productId: number, userId: number) => {
    const findLikeId = await this.prismaService.productLike.findMany({
      where: {
        userId: userId,
        productId: productId,
      },
      select: {
        id: true,
      },
    });
    const idSelected = findLikeId[0];
    if (!idSelected) {
      throw new NotFoundException(`like not found`);
    }
    const query = await this.prismaService.productLike.delete({
      where: {
        id: idSelected.id,
      },
    });
    return query;
  };
}
