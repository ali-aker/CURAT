import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '@modules/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // التحقق إن الإيميل مش موجود
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    // تشفير الباسورد
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // إنشاء المستخدم
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    // التحقق من المستخدم
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, is_active: true },
    });

    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // التحقق من الباسورد
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // توليد الـ Tokens
    const tokens = await this.generateTokens(user);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshTokens(user: User) {
    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      branch_id: user.branch_id,
    };

    const accessOptions: JwtSignOptions = {
      secret: this.configService.get<string>('app.jwt.secret'),
      expiresIn: 900, // 15 minutes in seconds
    };

    const refreshOptions: JwtSignOptions = {
      secret: this.configService.get<string>('app.jwt.refreshSecret'),
      expiresIn: 604800, // 7 days in seconds
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, accessOptions),
      this.jwtService.signAsync(payload, refreshOptions),
    ]);

    return { access_token, refresh_token };
  }
}
