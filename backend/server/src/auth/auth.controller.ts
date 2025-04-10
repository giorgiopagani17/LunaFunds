import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      name: string;
      accountName: string;
      currency: string;
    },
  ) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      registerDto.accountName,
      registerDto.currency,
    );
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    const refresh_token = body.refresh_token; // Ottieni il refresh token dal corpo della richiesta

    // Assicurati di controllare se refresh_token è definito
    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Decodifica il refresh token per ottenere l'ID dell'utente
    let userId: number;

    try {
      const decoded = this.jwtService.verify(refresh_token); // Decodifica il refresh token
      userId = decoded.sub; // Estrai l'ID dell'utente dal payload
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    console.log('User ID:', userId); // Log dell'ID dell'utente

    // Assicurati di controllare se userId è effettivamente definito
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    // Restituisci il nuovo token di accesso
    return this.authService.refreshAccessToken(userId, refresh_token);
  }
}
