import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async generateIban(): Promise<string> {
    const countryCode = 'LF';
    const checkDigits = '60';
    const bankCode = '12345';
    const branchCode = '67890';

    while (true) {
      const accountNumber = Math.random()
        .toString()
        .slice(2, 14)
        .padStart(12, '0');

      const iban = `${countryCode}${checkDigits}${bankCode}${branchCode}${accountNumber}`;

      const checkIban = await this.prisma.users.findMany({
        where: {
          iban,
        },
      });

      if (checkIban.length === 0) {
        return iban;
      }
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    // Fetch the account associated with the user ID
    const account = await this.prisma.accounts.findFirst({
      where: {
        userId: user.id,
        default: true, // Assuming 'is_default' is a boolean field
      },
    });

    if (!account) {
      throw new UnauthorizedException('Default account not found');
    }

    const userGroups = await this.prisma.userGroup.findMany({
      where: {
        userId: user.id,
      },
    });

    let firstGroupId = 0;

    if (userGroups.length > 0) {
      firstGroupId = userGroups[0].groupId;
    }

    const firstGroup = await this.prisma.groups.findUnique({
      where: {
        id: firstGroupId,
      },
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.generateRefreshToken(user.id),
      currency: user.currency,
      name: user.name,
      iban: user.iban,
      account_id: account.id, // Include the account ID in the response
      group_id: firstGroup ? firstGroup.id : 0, // Include the group ID in the response
    };
  }

  async refreshAccessToken(userId: number, refresh_token: string) {
    const decoded = this.verifyRefreshToken(refresh_token);
    if (!decoded) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { email: decoded.email, sub: userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

  private generateRefreshToken(userId: number): string {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '7d' });
  }

  async register(
    email: string,
    password: string,
    name: string,
    accountName: string,
    currency: string,
  ) {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new UnauthorizedException('User already exists');
      }

      const iban = await this.generateIban();

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.users.create({
        data: {
          email,
          password: hashedPassword,
          name,
          currency,
          iban,
        },
      });

      const account = await this.prisma.accounts.create({
        data: {
          userId: user.id,
          name: accountName,
          default: true,
        },
      });

      const categories = [
        { name: 'Transfer', image: 'transfer.jpg' },
        { name: 'Group', image: 'group.jpg' },
        { name: 'Bank Transfer', image: 'banktransfer.jpg' },
        { name: 'Crypto', image: 'crypto.jpg' },
        { name: 'Income', image: 'income.jpg' },
        { name: 'Expense', image: 'expense.jpg' },
      ];

      for (const category of categories) {
        await this.prisma.categories.create({
          data: {
            name: category.name,
            image: category.image,
            userId: user.id,
          },
        });
      }

      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.generateRefreshToken(user.id);

      return {
        currency: user.currency,
        name: user.name,
        account_id: account.id,
        group_id: 0,
        access_token: accessToken,
        refresh_token: refreshToken,
        iban,
      };
    } catch (error) {
      console.error('Error during registration:', error);
      throw new UnauthorizedException('Registration failed');
    }
  }
}
