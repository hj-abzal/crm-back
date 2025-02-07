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
  Logger,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Tasks } from './tasks.model';
import { TaskDto } from './task.dto';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';
import { USER_ROLE } from '../users/user-role.enums';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAllTasks(
    @Query('lastUpdatedAt') lastUpdatedAt: string,
    @Query('managerId') managerId: number,
    @Req() req: ExpressGuarded,
  ) {
    try {
      return await this.tasksService.findAll(
        lastUpdatedAt,
        req.user.role === USER_ROLE.ADMIN ? managerId : req.user.userId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while fetching tasks',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while fetching all tasks. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getTaskById(@Param('id', ParseIntPipe) taskId: number): Promise<Tasks> {
    try {
      const task = await this.tasksService.findOne(taskId);
      if (!task) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }
      return task;
    } catch (error) {
      this.logger.error(`Error fetching task ID: ${taskId}`, error);
      throw error;
    }
  }

  @Post()
  async createTask(
    @Body() createTaskDto: TaskDto,
    @Req() request: ExpressGuarded,
  ): Promise<Tasks> {
    try {
      const managerId = request.user.userId;
      return this.tasksService.create(createTaskDto, managerId);
    } catch (error) {
      this.logger.error('Error creating task', error);
      throw error;
    }
  }

  @Patch(':id')
  async updateTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: TaskDto,
    @Req() request: ExpressGuarded,
  ): Promise<Tasks> {
    try {
      const managerId = request.user.userId;
      return this.tasksService.update(taskId, updateTaskDto, managerId);
    } catch (error) {
      this.logger.error(`Error updating task ID: ${taskId}`, error);
      throw error;
    }
  }

  @Delete(':id')
  async deleteTask(
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<{ message: string }> {
    try {
      await this.tasksService.remove(taskId);
      return { message: `Task with id ${taskId} has been deleted` };
    } catch (error) {
      this.logger.error(`Error deleting task ID: ${taskId}`, error);
      throw error;
    }
  }
}
