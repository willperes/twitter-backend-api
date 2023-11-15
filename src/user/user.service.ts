import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/CreateUserDto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, username } = createUserDto;

    await this.validateExistingUser(
      createUserDto.email,
      createUserDto.username,
    );

    const now = new Date();
    const insertionData = new User(email, username, name, now, now);

    const user = new this.userModel(insertionData);
    await user.save();

    return user.toObject();
  }

  private async validateExistingUser(
    email: string,
    username: string,
  ): Promise<void> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }
  }
}
