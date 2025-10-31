import { Controller, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.usersService.registerUser(registerUserDto);
    }
}
