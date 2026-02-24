import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req) {
    return this.authService.logout();
  }

  @Post('register')
  async register(@Body() body: {
    username: string;
    password: string;
    name: string;
    email: string;
    roleId: number;
  }) {
    return this.authService.register(
      body.username,
      body.password,
      body.name,
      body.email,
      body.roleId,
    );
  }
}
