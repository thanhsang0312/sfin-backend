import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas';
import { CategoryRepository } from './repository/category.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
  ],
  providers: [CategoryService, CategoryRepository],
  controllers: [CategoryController],
  exports: [
    CategoryService, CategoryRepository
  ]
})
export class CategoryModule {}
