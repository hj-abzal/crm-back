import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './modules/auth/auth.module';
import { Users } from './modules/users/users.model';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { ContactsModule } from './modules/contacts/contacts.module';
import { TagsModule } from './modules/tags/tags.module';
import { CitiesModule } from './modules/cities/cities.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ContactSourceModule } from './modules/contact-source/contact-source.module';
import { EventsModule } from './modules/events/events.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { GatewaysModule } from './gateway/gateways.module';

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
        synchronize: true, // DEV only
        models: [
          Users,
          // Contacts,
          // ContactPhones,
          // Tags,
          // ContactTag,
          // Cities,
          // ContactSources,
          // Events,
          // Comments,
          // Tasks,
        ],
      }),
    }),
    UsersModule,
    AuthModule,
    ContactsModule,
    TagsModule,
    CitiesModule,
    CommentsModule,
    ContactSourceModule,
    EventsModule,
    TagsModule,
    TasksModule,
    GatewaysModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
