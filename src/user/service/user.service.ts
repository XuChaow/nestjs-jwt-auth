import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userData: CreateUserDto ) : Promise<User> {
    const user    = new User();
    user.name     = userData.name;
    user.email    = userData.email;
    user.roles    = ['user'];
    user.isActive = true;
    user.password = await this.hashPassword(userData.password);
    return this.userRepository.save(user);
  }

  getUserByEmail(email): Promise<User> {
    return this.userRepository.findOne({ email : email });
  }

  hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
          return err ? reject(null): resolve(hash);
        });
      });
    });
  }

  checkPassword(user: User, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (error, ok) => {
        return (error || !ok) ? resolve(false) : resolve(true);
      });
    });
  }

}