// EVENT_BACK/auth-server/src/users/users.service.ts

import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { User, UserDocument } from '../auth/schemas/user.schema';

import { SignUpDto } from './dto/signup.dto';


@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }
    async signUp(signUpDto: SignUpDto): Promise<UserDocument> {
        const { username, password } = signUpDto;
        console.log('signUpDto:', signUpDto);

        const hashedPassword = await this.hashPassword(password);
        console.log('hashedPassword:', hashedPassword);

        try {
            const newUser = await this.userModel.create({
                username,
                password: hashedPassword,
                role: 'USER',
            });

            console.log('New user created:', newUser);
            return newUser;
        } catch (error) {
            console.error('signUp error:', error);
            if (error.code === 11000) {
                throw new ConflictException(`Username "${username}" already exists.`);
            }
            throw new InternalServerErrorException('Failed to save user.');
        }
    }


    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    async findById(id: string): Promise<UserDocument | null> {
        try {
            const user = await this.userModel.findById(id).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Error finding user.');
        }
    }
}