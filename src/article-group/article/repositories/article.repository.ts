import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { Repository } from 'typeorm';
import { Article } from '@/.typeorm/entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';
import { DiseaseTypesService } from '@/disease-types/services/disease-types.service';
import { DiseaseType } from '@/.typeorm/entities/disease-types.entity';
import { PaginatedResponse } from '@/response/response.interface';

export interface ArticleParams {
  page?: number;
  limit?: number;
  search?: string;
  diseaseIds?: number[];
}

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    @InjectRepository(DiseaseType)
    private readonly diseaseRepository: Repository<DiseaseType>,
    private readonly diseaseTypesService: DiseaseTypesService,
  ) {}

  async create(dto: CreateArticleDto): Promise<Article> {
    try {
      const { DISEASES_TYPE_IDS, ...articleData } = dto;

      const article = this.repository.create(articleData);

      if (
        DISEASES_TYPE_IDS &&
        Array.isArray(DISEASES_TYPE_IDS) &&
        DISEASES_TYPE_IDS.length > 0
      ) {
        // Ensure we're working with numbers
        const diseaseIds = DISEASES_TYPE_IDS.map((id) => Number(id));

        const diseasesTypes =
          await this.diseaseTypesService.findByIds(diseaseIds);

        if (diseasesTypes.length) {
          article.diseases = diseasesTypes;
        }
      }

      return await this.repository.save(article);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Article already exists');
      }
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  async bulkCreate(dtos: CreateArticleDto[]): Promise<Article[]> {
    try {
      let articles = [];
      dtos.forEach(async (dto) => {
        const article = this.repository.create(dto);
        articles.push(article);
      });

      return await this.repository.save(articles);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create articles');
    }
  }

  async findById(id: number): Promise<Article> {
    const article = await this.repository.findOne({
      where: { AID: id },
      relations: ['diseases'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async findAll(params: ArticleParams): Promise<PaginatedResponse<Article>> {
    const { page = 1, limit = 10, search, diseaseIds } = params;
    const queryBuilder = this.repository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.diseases', 'disease');

    if (diseaseIds) {
      queryBuilder.andWhere('disease.DISEASE_ID IN (:...diseaseIds)', {
        diseaseIds,
      });
    }

    if (search) {
      queryBuilder.andWhere('article.TOPIC ILIKE :search', {
        search: `%${search}%`,
      });
    }

  const total = await queryBuilder.getCount();

    // Include all order by fields in the select clause
    queryBuilder
      .select([
        'article.AID', // Specify the AID column from the article table
        'article.TOPIC',
        'article.ESTIMATED_READ_TIME',
        'article.THUMBNAIL_URL',
        'article.PUBLISH_DATE',
        'article.VIEW_COUNT', // Include the field you are ordering by
        'disease.DISEASE_ID',
        'disease.TH_NAME',
        'disease.ENG_NAME',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy({
        'article.VIEW_COUNT': 'DESC',
        'article.TOPIC': 'ASC',
        'article.PUBLISH_DATE': 'DESC',
      });

    const data = await queryBuilder.getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findById(id);
    const { DISEASES_TYPE_IDS, ...articleData } = updateArticleDto;

    if (DISEASES_TYPE_IDS && DISEASES_TYPE_IDS.length > 0) {
      const diseaseTypes =
        await this.diseaseTypesService.findByIds(DISEASES_TYPE_IDS);
      if (diseaseTypes.length > 0) {
        article.diseases = diseaseTypes;
      }
    }

    try {
      Object.assign(article, articleData);
      return await this.repository.save(article);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Article with this topic already exists');
      }
      throw new InternalServerErrorException('Failed to update article');
    }
  }

  async remove(id: number): Promise<{ message: string; success: boolean }> {
    const result = await this.repository.delete({ AID: id });

    if (result.affected === 0) {
      throw new NotFoundException('Article not found');
    }

    return {
      message: `Article with ${id} successfully deleted`,
      success: true,
    };
  }
}
