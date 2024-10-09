import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.PASSWORD))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { PASSWORD, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<any> {
    const payload = { EMAIL: user.EMAIL, sub: user.UID };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
