import { Injectable } from '@nestjs/common';


export interface User {
    id: string;
    email: string;
    password: string;
    username: string;
}

@Injectable()
export class UserService {
    private readonly users: User[] = [];

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.users.find(user => user.email === email);
    }

    async create(user: Omit<User, 'id'>): Promise<User> {
        const newUser = {
            ...user,
            id: Math.random().toString(36).substring(7),
        };
        this.users.push(newUser);
        return newUser;
    }
}
