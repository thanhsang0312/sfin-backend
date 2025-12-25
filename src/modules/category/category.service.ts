import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './repository/category.repository';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { ResponseType } from '@common/dtos';
import { CodeResponseEnum } from '@common/enums/code-response.enum';
import { MESSAGE_CODES } from '@common/constants';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository
    ) { }

    async createCategory(createCategoryDto: CreateCategoryDto): Promise<ResponseType> {
        try {
            const { name } = createCategoryDto;
            const tag = name.toLowerCase().replace(" ", "-");
            const result = await this.categoryRepository.create({ ...createCategoryDto, tag });
            return {
                code: CodeResponseEnum.SUCCESS,
                data: result,
                message: MESSAGE_CODES.SUCCESS
            }
        } catch (error) {
            throw error
        }
    }
}
