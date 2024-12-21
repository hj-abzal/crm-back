import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Tasks } from './tasks.model';
import { TaskDto } from './task.dto';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';

@Controller('tasks')
@UseGuards(AuthGuard) // Ensure all routes require authentication
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllTasks(): Promise<Tasks[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getTaskById(@Param('id', ParseIntPipe) taskId: number): Promise<Tasks> {
    const task = await this.tasksService.findOne(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }
    return task;
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Body() createTaskDto: TaskDto,
    @Req() request: ExpressGuarded,
  ): Promise<Tasks> {
    const managerId = request.user.userId; // from AuthGuard
    return this.tasksService.create(createTaskDto, managerId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: TaskDto,
    @Req() request: ExpressGuarded,
  ): Promise<Tasks> {
    const managerId = request.user.userId;
    return this.tasksService.update(taskId, updateTaskDto, managerId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteTask(
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<{ message: string }> {
    await this.tasksService.remove(taskId);
    return { message: `Task with id ${taskId} has been deleted` };
  }
}
