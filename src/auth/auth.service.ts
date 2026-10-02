import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './jwt-payload.js';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const email = registerDto.email.toLowerCase().trim();

    const existingUser = await this.usersService.findByEmailWithPassword(email);
    if (existingUser !== null) {
      throw new ConflictException('This email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create(registerDto.fullName, email, passwordHash);

    const accessToken = await this.createToken(user);

    return { accessToken: accessToken, user: user };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const email = loginDto.email.toLowerCase().trim();

    const userWithPassword = await this.usersService.findByEmailWithPassword(email);
    if (userWithPassword === null) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, userWithPassword.passwordHash);
    if (passwordMatches === false) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.usersService.findOne(userWithPassword.id);

    const accessToken = await this.createToken(user);

    return { accessToken: accessToken, user: user };
  }

  private async createToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}