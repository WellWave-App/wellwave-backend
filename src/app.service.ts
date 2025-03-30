import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('Database connection has been established successfully.');
    } catch (error) {
      this.logger.error('Unable to connect to the database:', error);
      // Optionally, you might want to rethrow the error or handle it in a way
      // that prevents the application from starting if the DB is not available
      // throw error;
    }
  }

  getHello(): string {
    return 'Hello World We are wellwave 2025!';
  }
}
