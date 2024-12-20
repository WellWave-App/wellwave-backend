import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
// import { RegisterUserDto } from '../dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterUserDto } from '../dto/register.dto';
import { ValidationTypes } from 'class-validator';

const imageFileValidator = new ParseFilePipe({
  validators: [
    new FileTypeValidator({
      fileType: /(image\/jpeg|image\/png|image\/gif)/,
    }),
    new MaxFileSizeValidator({
      maxSize: 10 * 1024 * 1024,
      message: 'file must be smaller than 10 MB',
    }), // 10MB
  ],
  fileIsRequired: false,
});

// @ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll(page, limit);
  }

  @Post('/register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    // const user = await this.usersService.findOneByEmail(req.user.EMAIL);
    // return req.user.UID;
    return this.usersService.getProfile(req.user.UID);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':uid')
  findOne(@Param('uid') UID: string) {
    return this.usersService.findOne(+UID);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imgFile'))
  @Patch(':uid')
  update(
    @Request() req,
    @Param('uid') UID: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(imageFileValidator)
    file?: Express.Multer.File,
  ) {
    if (req.user.UID !== +UID) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(+UID || +req.user.UID, updateUserDto, file);
    // return updateUserDto;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':uid')
  remove(@Param('uid') UID: string) {
    return this.usersService.remove(+UID);
  }

  // @Post('/upload')
  // @UseInterceptors(FileInterceptor('imgFile'))
  // uploadPic(@UploadedFile(imageFileValidator) file?: Express.Multer.File) {
  //   // console.log(file);
  //   return this.usersService.uploadFile(file);
  // }
}
