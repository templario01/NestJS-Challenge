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
import { plainToClass } from 'class-transformer';
import { ContentTypeDto } from './dto/content-type.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ReadImageProductDto } from './dto/read-image-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly attachmentsService: AttachmentService,
  ) {}

  findAll = async (
    paginationQueryDto: PaginationQueryDto,
    uuid = '',
  ): Promise<ProductResponseDto[]> => {
    const { limit, offset } = paginationQueryDto;
    const query = await this.prismaService.product.findMany({
      skip: offset,
      take: limit,
      where: {
        active: uuid === '' ? true : {},
      },
      select: {
        id: true,
        uuid: true,
        stock: true,
        price: true,
        active: true,
        name: true,
        category: { select: { name: true } },
        likes: true,
      },
    });
    const response = query.map((product) =>
      plainToClass(ProductResponseDto, {
        ...product,
        price: product.price.toNumber(),
      }),
    );
    return response;
  };

  findByCategory = async (uuid: string): Promise<ProductResponseDto[]> => {
    let category;
    try {
      category = await this.prismaService.category.findFirst({
        where: { uuid },
      });
    } catch (e) {
      throw new NotFoundException('Category not found');
    }
    const products = await this.prismaService.product.findMany({
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
    const response = products.map((product) =>
      plainToClass(ProductResponseDto, {
        ...product,
        price: product.price.toNumber(),
      }),
    );
    return response;
  };

  findProduct = async (uuid: string): Promise<ProductResponseDto> => {
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

      const imagesUrl = await this.attachmentsService.getImages(uuid);
      const product = plainToClass(ReadImageProductDto, {
        ...query,
        price: query.price.toNumber(),
        categoryName: query.category.map((c) => c.name),
        imagesUrl,
      });

      return plainToClass(ProductResponseDto, product);
    } catch (error) {
      throw new NotFoundException(`Product #${uuid} not found`);
    }
  };

  createProduct = async (
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> => {
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
    return plainToClass(ProductResponseDto, {
      ...product,
      price: product.price.toNumber(),
    });
  };

  verifyCategories = async (categoryName: string[]): Promise<void> => {
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
  ): Promise<ProductResponseDto> => {
    // let query = null;
    if (
      !updateProductDto.categoryName ||
      updateProductDto.categoryName.length == 0
    ) {
      const product = await this.prismaService.product.update({
        where: {
          uuid: uuid,
        },
        data: {
          active: updateProductDto.active,
          price: updateProductDto.price,
          stock: updateProductDto.stock,
          name: updateProductDto.name,
        },
        include: {
          category: true,
        },
      });
      return plainToClass(ProductResponseDto, {
        ...product,
        price: product.price.toNumber(),
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
    const product = await this.prismaService.product.update({
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
      include: {
        category: true,
      },
    });
    return plainToClass(ProductResponseDto, {
      ...product,
      price: product.price.toNumber(),
    });
  };

  deleteProduct = async (uuid: string): Promise<MessageResponseDto> => {
    try {
      await this.prismaService.product.delete({
        where: {
          uuid: uuid,
        },
      });
      return { message: `Product #${uuid} deleted successfull` };
    } catch (error) {
      throw new NotFoundException(`Product #${uuid} not found`);
    }
  };

  setLike = async (
    productUuid: string,
    userUuid: string,
  ): Promise<MessageResponseDto> => {
    const findLikeId = await this.prismaService.productLike.findFirst({
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

    if (findLikeId) {
      throw new ForbiddenException(
        `User #${userUuid} already have Like in product #${productUuid}`,
      );
    }

    await this.prismaService.productLike.create({
      data: {
        product: {
          connect: { uuid: productUuid },
        },
        user: {
          connect: { uuid: userUuid },
        },
      },
    });
    await this.prismaService.product.update({
      where: {
        uuid: productUuid,
      },
      data: { likes: { increment: 1 } },
    });
    return { message: `Like in product #${productUuid} created successfull` };
  };

  deleteLike = async (
    productUuid: string,
    userUuid: string,
  ): Promise<MessageResponseDto> => {
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
      throw new NotFoundException(
        `User #${userUuid} not have Like in product #${productUuid}`,
      );
    }
    await this.prismaService.productLike.delete({
      where: {
        id: idSelected.id,
      },
    });

    await this.prismaService.product.update({
      where: {
        uuid: productUuid,
      },
      data: { likes: { decrement: 1 } },
    });
    return { message: `Like in product #${productUuid} deleted successfull` };
  };

  async uploadImagesToProduct(
    productUuid: string,
    content: ContentTypeDto,
  ): Promise<AttachmentDto> {
    let product;
    try {
      product = await this.prismaService.product.findUnique({
        where: { uuid: productUuid },
      });
    } catch (error) {
      throw new NotFoundException(`Product #${productUuid} not found`);
    }
    const attachment = await this.attachmentsService.uploadImages(
      productUuid,
      content.contentType,
    );
    await this.prismaService.product.update({
      where: { id: product.id },
      data: { images: { connect: { id: attachment.id } } },
      include: { images: true },
    });
    return attachment;
  }
}
