import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './modules/auth/auth.module';
import { Users } from './modules/users/users.model';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { ContactsModule } from './modules/contacts/contacts.module';
import { Contacts } from './modules/contacts/models/contacts.model';
import { ContactPhones } from './modules/contacts/models/contact-phones.model';
import { Tags } from './modules/tags/tags.model';
import { ContactTag } from './modules/tags/contact-tag.model';
import { Cities } from './modules/cities/cities.model';
import { TagsModule } from './modules/tags/tags.module';
import { CitiesModule } from './modules/cities/cities.module';
import { ContactSources } from './modules/contact-source/contact-source.model';

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
        models: [
          Users,
          Contacts,
          ContactPhones,
          Tags,
          ContactTag,
          Cities,
          ContactSources,
        ],
      }),
    }),
    UsersModule,
    AuthModule,
    ContactsModule,
    TagsModule,
    CitiesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
