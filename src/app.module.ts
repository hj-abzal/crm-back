import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailsModule } from './modules/mails/mails.module';
import { AuthModule } from './modules/auth/auth.module';
import { Users } from './modules/users/users.model';
import { LoggingMiddleware } from './middlewares/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('PGHOST'),
        port: configService.get<number>('PGPORT'),
        username: configService.get<string>('PGUSER'),
        password: configService.get<string>('PGPASSWORD'),
        database: configService.get<string>('PGDATABASE'),
        ssl: false, // DEV only
        autoLoadModels: true, // DEV only
        synchronize: true,
        models: [Users],
      }),
    }),
    UsersModule,
    AuthModule,
    MailsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
