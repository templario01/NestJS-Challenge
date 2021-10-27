import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

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

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(Number(id));
  }

  @Post(':id/like')
  setLike(@Param('id') id: string) {
    //aun no hay usuario
    return this.productService.setLike(Number(id), 1);
  }

  @Delete(':id/removelike')
  removeLike(@Param('id') id: string) {
    //aun no hay usuario
    return this.productService.deleteLike(Number(id), 1);
  }
}
