import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { jwtAuthGuard } from 'src/common/guards/token.guard';
import { ContentTypeDto, TypesEnum } from './dto/content-type.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findProduct(@Param('id') id: number) {
    return this.productService.findProduct(id);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: number) {
    return this.productService.findByCategory(categoryId);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProductAndCategories(
      Number(id),
      updateProductDto,
    );
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(Number(id));
  }

  @UseGuards(jwtAuthGuard)
  @Post(':id/like')
  setLike(@Param('id') id: string) {
    //aun no hay usuario
    return this.productService.setLike(Number(id), 1);
  }

  @UseGuards(jwtAuthGuard)
  @Delete(':id/removelike')
  removeLike(@Param('id') id: string) {
    //aun no hay usuario
    return this.productService.deleteLike(Number(id), 1);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Post(':id/uploadfile')
  createAttachment(
    @Param('id') productId: number,
    @Body() contentType: ContentTypeDto,
  ) {
    const ct: ContentTypeDto = { contentType: TypesEnum.IMAGEPNG };
    return this.productService.uploadImagesToProduct(productId, ct);
  }
}
