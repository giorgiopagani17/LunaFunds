import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Assicurati che questa chiave sia configurata correttamente
    });
  }

  async validate(payload: any) {
    // Il payload contiene le informazioni dell'utente, puoi restituire ciò di cui hai bisogno.
    return { userId: payload.sub, email: payload.email };
  }
}
