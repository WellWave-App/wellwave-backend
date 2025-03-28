import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { DiseaseTypesSeeder } from './.typeorm/seeders/disease-types.seeder';
// import { HabitTypesSeeder } from './.typeorm/seeders/habit-types.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //open access
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // set up swagger
  const options = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'API Server')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  // cookies
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips non-whitelisted properties
      transform: true, // transforms payloads to be objects typed according to their DTO classes
      forbidNonWhitelisted: true, // throws errors when non-whitelisted properties are present
    }),
  );

  // Run seeders
  const diseaseTypesSeeder = app.get(DiseaseTypesSeeder);
  // const habitTypesSeeder = app.get(HabitTypesSeeder);

  await Promise.all([
    diseaseTypesSeeder.seed(),
    // habitTypesSeeder.seed()
  ]);

  // run app  on port
  await app.listen(3000);
}
bootstrap();
