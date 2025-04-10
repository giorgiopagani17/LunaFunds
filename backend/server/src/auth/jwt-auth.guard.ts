// src/auth/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Estrai il token dal header
      try {
        const user = this.jwtService.verify(token); // Verifica il token
        request.user = user; // Aggiungi le informazioni dell'utente alla richiesta
        return true; // Permetti l'accesso all'endpoint
      } catch (error) {
        throw new UnauthorizedException('Token non valido', error); // Gestisci errori di token non valido
      }
    } else {
      throw new UnauthorizedException('Token mancante'); // Gestisci l'assenza del token
    }
  }
}
