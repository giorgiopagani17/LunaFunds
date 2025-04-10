import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard) // Applica il guard a tutte le rotte di questo controller
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/user')
  async getCategories(@Request() req) {
    return this.categoryService.getCategories(req.user.sub);
  }

  @Get('/user/transactions')
  async getCategoriesWithTransactionSum(
    @Request() req,
    @Query('accountID', ParseIntPipe) accountID: number,
  ) {
    return this.categoryService.getCategoriesWithTransactionSum(
      req.user.sub,
      accountID,
    );
  }

  @Post()
  async createCategory(
    @Request() req,
    @Body() CreateCategoryDto: CreateCategoryDto,
  ) {
    CreateCategoryDto.userId = req.user.sub;
    return this.categoryService.createCategory(CreateCategoryDto);
  }

  @Delete('delete/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategory(id);
  }

  @Put('update/:id')
  async updateCategory(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() CreateCategoryDto: CreateCategoryDto,
  ) {
    CreateCategoryDto.userId = req.user.sub;
    return this.categoryService.updateCategory(id, CreateCategoryDto);
  }
}
