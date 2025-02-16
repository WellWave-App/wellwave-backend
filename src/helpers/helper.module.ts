import { Module } from '@nestjs/common';
import { DateService } from './date/date.services';

@Module({
  imports: [],
  controllers: [],
  providers: [DateService],
  exports: [DateService],
})
export class HelperModule {}
