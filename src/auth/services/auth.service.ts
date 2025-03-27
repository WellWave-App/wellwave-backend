import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
// import { RegisterUserDto } from 'src/users/dto/register.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Role } from '../roles/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getByEmail(email);
    if (user && (await bcryptjs.compare(password, user.PASSWORD))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { PASSWORD, ...result } = user;
      return {
        ...result,
        ROLE: user.ROLE || Role.USER,
      };
    }
    return null;
  }

  async login(user: any): Promise<any> {
    const payload = {
      EMAIL: user.EMAIL,
      UID: user.UID,
      ROLE: user.ROLE || [Role.USER],
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async googleLogin(req): Promise<any> {
    if (!req.user) {
      throw new NotFoundException(
        'Google login failed: No user information received.',
      );
    }

    const { GOOGLE_ID, EMAIL, USERNAME, IMAGE_URL, YEAR_OF_BIRTH, GENDER } =
      req.user;

    try {
      let user = await this.userService.getByEmail(EMAIL);

      if (!user) {
        const createUserDto: CreateUserDto = {
          EMAIL,
          USERNAME,
          GOOGLE_ID,
          IMAGE_URL,
          YEAR_OF_BIRTH,
          GENDER,
          ROLE: Role.USER,
          // Add any other required fields with default values
        };

        user = await this.userService.create(createUserDto);
        if (!user) {
          throw new InternalServerErrorException('Failed to create new user');
        }
      }
      // else if (!user.GOOGLE_ID) {
      //   user.GOOGLE_ID = GOOGLE_ID;
      //   user.IMAGE_URL = IMAGE_URL;
      //   if (YEAR_OF_BIRTH && !user.YEAR_OF_BIRTH) {
      //     user.YEAR_OF_BIRTH = YEAR_OF_BIRTH;
      //   }
      //   if (GENDER !== null && user.GENDER === null) {
      //     user.GENDER = GENDER;
      //   }
      //   user = await this.userService.update(user.UID, user);
      //   if (!user) {
      //     throw new InternalServerErrorException('Failed to update user');
      //   }
      // }

      const payload = {
        EMAIL: user.EMAIL,
        UID: user.UID,
        ROLE: user.ROLE || Role.USER,
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('Error in googleLogin:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred during Google login',
      );
    }
  }
}
