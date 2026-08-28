import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CsrfService } from '../../common/services/csrf.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @Get('csrf-token')
  getCsrfToken() {
    return {
      csrfToken: this.csrfService.generateToken(),
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user._id.toString());
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    return this.authService.logout(req.user._id.toString());
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  getActiveSessions(@CurrentUser() user: any) {
    return this.authService.getActiveSessions(user._id.toString());
  }

  @Put('two-factor')
  @UseGuards(JwtAuthGuard)
  toggleTwoFactor(@Body() body: { enabled: boolean }, @CurrentUser() user: any) {
    return this.authService.toggleTwoFactor(user._id.toString(), body.enabled);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  terminateSession(@Param('sessionId') sessionId: string, @CurrentUser() user: any) {
    return this.authService.terminateSession(user._id.toString(), sessionId);
  }

  @Post('two-factor/verify')
  @UseGuards(JwtAuthGuard)
  verifyTwoFactorSetup(@Body() body: { code: string }, @CurrentUser() user: any) {
    return this.authService.verifyTwoFactorSetup(user._id.toString(), body.code);
  }

  @Post('verify-email')
  verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }
}
