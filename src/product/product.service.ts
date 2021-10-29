import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentService } from '../attachment/attachment.service';
import { AttachmentDto } from '../attachment/dto/attachment.dto';
import { PaginationQueryDto } from '../common/guards/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ContentTypeDto } from './dto/content-type.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly attachmentsService: AttachmentService,
  ) {}

  findAll = async (paginationQueryDto: PaginationQueryDto) => {
    const { limit, offset } = paginationQueryDto;
    const query = await this.prismaService.product.findMany({
      skip: offset,
      take: limit,
      where: {
        active: true,
      },
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

  findByCategory = async (uuid: string) => {
    let category;
    try {
      category = await this.prismaService.category.findFirst({
        where: { uuid },
      });
    } catch (e) {
      throw new NotFoundException('Category not found');
    }
    return await this.prismaService.product.findMany({
      where: {
        active: {
          equals: true,
        },
        category: {
          some: {
            uuid: category.uuid,
          },
        },
      },
    });
  };

  findProduct = async (uuid: string) => {
    try {
      const query = await this.prismaService.product.findUnique({
        where: {
          uuid: uuid,
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
      throw new NotFoundException(`Product #${uuid} not found`);
    }
  };

  createProduct = async (createProductDto: CreateProductDto) => {
    await this.verifyCategories(createProductDto.categoryName);

    const product = await this.prismaService.product.create({
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
    return product;
  };

  verifyCategories = async (categoryName: string[]) => {
    const categories = await this.prismaService.category.findMany({
      where: {
        name: { in: categoryName },
      },
    });
    const categoriesMap = categories.map((c) => c.name);

    categoryName.forEach((name) => {
      if (!categoriesMap.includes(name)) {
        throw new BadRequestException(`Category #${name} not found`);
      }
    });
  };

  updateProductAndCategories = async (
    uuid: string,
    updateProductDto: UpdateProductDto,
  ) => {
    // let query = null;
    if (updateProductDto.categoryName.length == 0) {
      return await this.prismaService.product.update({
        where: {
          uuid: uuid,
        },
        data: {
          active: updateProductDto.active,
          price: updateProductDto.price,
          stock: updateProductDto.stock,
          name: updateProductDto.name,
        },
      });
    }

    await this.verifyCategories(updateProductDto.categoryName);
    // #2 comparar las categorias nuevas con las existentes
    // y eliminar las que ya no son nuevas
    const newCategoriesProduct = updateProductDto.categoryName;

    // #1 romper conexiones con todas las categorias
    await this.prismaService.product.update({
      where: {
        uuid: uuid,
      },
      data: {
        category: {
          set: [],
        },
      },
      include: { category: true },
    });

    // #2 asignar las nuevas conexiones con categorias
    return await this.prismaService.product.update({
      where: {
        uuid,
      },
      data: {
        active: updateProductDto.active,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
        name: updateProductDto.name,
        category: {
          connect: newCategoriesProduct.map((c) => ({ name: c })),
        },
      },
    });
  };

  deleteProduct = async (uuid: string) => {
    try {
      await this.prismaService.product.delete({
        where: {
          uuid: uuid,
        },
      });
      return { content: `Product #${uuid} deleted successfull` };
    } catch (error) {
      throw new NotFoundException(`Product #${uuid} not found`);
    }
  };

  setLike = async (productUuid: string, userUuid: string) => {
    const findLikeId = await this.prismaService.productLike.findMany({
      where: {
        user: {
          uuid: userUuid,
        },
        product: {
          uuid: productUuid,
        },
      },
      select: {
        id: true,
      },
    });
    const idSelected = findLikeId[0];
    if (idSelected) {
      throw new ForbiddenException(
        `user #${userUuid} already have Like in product #${productUuid}`,
      );
    }

    const query = await this.prismaService.productLike.create({
      data: {
        product: {
          connect: { uuid: productUuid },
        },
        user: {
          connect: { uuid: userUuid },
        },
      },
    });
    return query;
  };

  deleteLike = async (productUuid: string, userUuid: string) => {
    const findLikeId = await this.prismaService.productLike.findMany({
      where: {
        user: {
          uuid: userUuid,
        },
        product: {
          uuid: productUuid,
        },
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

  async uploadImagesToProduct(
    productUuid: string,
    content: ContentTypeDto,
  ): Promise<AttachmentDto> {
    const product = await this.prismaService.product.findUnique({
      where: { uuid: productUuid },
    });
    if (!product) {
      throw new NotFoundException();
    }
    const attachment = await this.attachmentsService.uploadImages(
      productUuid,
      content.contentType,
    );
    if (!attachment) {
      throw new NotFoundException();
    }
    await this.prismaService.product.update({
      where: { id: product.id },
      data: { images: { connect: { id: attachment.id } } },
    });
    return attachment;
  }
}
