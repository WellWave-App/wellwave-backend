import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification_history.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
