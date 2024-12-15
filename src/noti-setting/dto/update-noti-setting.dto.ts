import { PartialType } from '@nestjs/swagger';
import { CreateNotiSettingDto } from './create-noti-setting.dto';

export class UpdateNotiSettingDto extends PartialType(CreateNotiSettingDto) {}
