import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TaskTypeService } from './task-type.service';
import { CreateTaskTypeDto } from './dto/create-task-type.dto';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { USER_ROLE } from '../users/user-role.enums';

@Controller('task-types')
export class TaskTypeController {
  constructor(private readonly taskTypeService: TaskTypeService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  create(@Body() createTaskTypeDto: CreateTaskTypeDto) {
    return this.taskTypeService.create(createTaskTypeDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  findAll() {
    return this.taskTypeService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  findOne(@Param('id') id: string) {
    return this.taskTypeService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  update(@Param('id') id: string, @Body() updateTaskTypeDto: CreateTaskTypeDto) {
    return this.taskTypeService.update(+id, updateTaskTypeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  remove(@Param('id') id: string) {
    return this.taskTypeService.remove(+id);
  }
} 