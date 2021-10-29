import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { jwtAuthGuard } from 'src/common/guards/token.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Put(':id')
  updateCategory(
    @Param('id') uuid: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(uuid, updateCategoryDto);
  }

  @UseGuards(jwtAuthGuard, AdminGuard)
  @Delete(':id')
  deleteCategory(@Param('id') uuid: string) {
    return this.categoryService.deleteCategory(uuid);
  }
}
