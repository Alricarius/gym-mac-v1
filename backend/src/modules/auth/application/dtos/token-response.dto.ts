import { UserResponseDto } from '../../../users/application/dtos/user-response.dto';

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
