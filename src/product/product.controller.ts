import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { PaginationQueryDto } from '../common/guards/dto/pagination-query.dto';
import { jwtAuthGuard } from '../common/guards/token.guard';
import { ContentTypeDto } from './dto/content-type.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.productService.findAll(paginationQueryDto);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Get('admin')
  findAllAdmin(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Request() req,
  ) {
    return this.productService.findAll(paginationQueryDto, req.user.uuid);
  }

  @Get(':uuid')
  findProduct(@Param('uuid') uuid: string) {
    return this.productService.findProduct(uuid);
  }

  @Get('category/:categoryUuid')
  findByCategory(@Param('categoryUuid') categoryUuid: string) {
    return this.productService.findByCategory(categoryUuid);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Patch(':uuid')
  updateProduct(
    @Param('uuid') uuid: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProductAndCategories(
      uuid,
      updateProductDto,
    );
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Delete(':uuid')
  deleteProduct(@Param('uuid') uuid: string) {
    return this.productService.deleteProduct(uuid);
  }

  @UseGuards(jwtAuthGuard)
  @Post(':uuid/like')
  setLike(@Param('uuid') uuid: string, @Request() req) {
    return this.productService.setLike(uuid, req.user.uuid);
  }

  @UseGuards(jwtAuthGuard)
  @Delete(':uuid/removelike')
  removeLike(@Param('uuid') uuid: string, @Request() req) {
    return this.productService.deleteLike(uuid, req.user.uuid);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Post(':uuid/uploadfile')
  createAttachment(
    @Param('uuid') productUuid: string,
    @Body() contentType: ContentTypeDto,
  ) {
    return this.productService.uploadImagesToProduct(productUuid, contentType);
  }
}
