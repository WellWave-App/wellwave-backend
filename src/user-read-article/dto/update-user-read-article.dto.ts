import { PartialType } from '@nestjs/swagger';
import { CreateUserReadArticleDto } from './create-user-read-article.dto';

export class UpdateUserReadArticleDto extends PartialType(CreateUserReadArticleDto) {}
