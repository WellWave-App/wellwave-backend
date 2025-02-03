import { Role } from '@/auth/roles/roles.enum';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class FilterAdminInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Handle array of users
        if (Array.isArray(data)) {
          return data.filter((user) => !user?.ROLE || user.ROLE === Role.USER);
        }

        // Handle pagination response [data, count]
        if (
          Array.isArray(data) &&
          data.length === 2 &&
          Array.isArray(data[0])
        ) {
          const [users, count] = data;
          const filteredUsers = users.filter(
            (user) => !user?.ROLE || user.ROLE === Role.USER,
          );
          return [filteredUsers, filteredUsers.length];
        }

        // Handle single user
        if (data?.ROLE && data.ROLE !== Role.USER) {
          return null;
        }

        return data;
      }),
    );
  }
}
