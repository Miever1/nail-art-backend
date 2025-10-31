import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {

    }

    async registerUser(dto: RegisterUserDto) {
        const existingUser = await this.usersRepository.findOne({ where: { email: dto.email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

        const newUser = this.usersRepository.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });

        return this.usersRepository.save(newUser);
    }
}