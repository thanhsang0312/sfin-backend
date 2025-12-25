import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard, RoleGuard } from '@common/guards';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { ResponseType } from '@common/dtos';

@Controller('category')
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard, RoleGuard)
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) { }

    @Post("create")
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Food' },
                limitSpend: { type: 'number', example: 5000000 },
                description: { type: 'string', example: 'Expenses for food' },
            },
            required: ['name'],
        },
    })
    async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<ResponseType> {
        return this.categoryService.createCategory(createCategoryDto)
    }
}
