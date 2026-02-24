import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PositionModule } from './position/position.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Position } from './entities/position.entity';
import { AbilityDimension } from './entities/ability-dimension.entity';
import { Rank } from './entities/rank.entity';
import { Employee } from './entities/employee.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_DATABASE || 'procam',
      entities: [
        User,
        Role,
        Permission,
        Position,
        AbilityDimension,
        Rank,
        Employee,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Role, Permission, User]),
    AuthModule,
    UserModule,
    RoleModule,
    PositionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
