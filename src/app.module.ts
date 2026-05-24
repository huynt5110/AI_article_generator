import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import s3Config from './config/s3.config';
import { validate } from './config/env.validation';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { UploadsModule } from './modules/uploads/uploads.module';
import { DraftsModule } from './modules/drafts/drafts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, s3Config],
      validate,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    OrganizationsModule,
    UploadsModule,
    DraftsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
