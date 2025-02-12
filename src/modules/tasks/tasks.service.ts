import { Injectable, NotFoundException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tasks } from './tasks.model';
import { TaskDto } from './task.dto';
import { Op } from 'sequelize';
import { AppGateway } from '../../gateway/app.gateway';
import { TaskReassignments } from './task-reassignments.model';
import { Users } from '../users/users.model';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Tasks)
    private readonly tasksRepository: typeof Tasks,
    @InjectModel(TaskReassignments)
    private readonly taskReassignmentsRepository: typeof TaskReassignments,
    @InjectModel(Users)
    private readonly usersRepository: typeof Users,
    private readonly appGateway: AppGateway,
  ) {}

  async create(createTaskDto: TaskDto, managerId: number): Promise<Tasks> {
    this.logger.log('Creating new task');
    try {
      const manager = await this.usersRepository.findOne({
        where: { userId: createTaskDto.managerId },
      });
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${createTaskDto.managerId} does not exist`);
      }

      const { dueDate, ...rest } = createTaskDto;
      const parsedDueDate = dueDate ? new Date(dueDate) : null;

      const task = await this.tasksRepository.create({
        ...rest,
        dueDate: parsedDueDate || null,
        managerId: createTaskDto.managerId,
        createdByManagerId: managerId,
      });

      const createdTask = await this.findOne(task.taskId);

        this.appGateway.server
          .to(`manager_${createdTask.managerId}`)
          .emit('task_created', { payload: createdTask });

      this.appGateway.server
        .to('admin')
        .emit('task_created', { payload: createdTask });

      return createdTask;
    } catch (error) {
      this.logger.error('Error creating task', error);
      throw error;
    }
  }

  async findAll(lastUpdated?: string, managerId?: number): Promise<{
    tasks: Tasks[];
    lastUpdatedAt: string | null;
    reassignments: TaskReassignments[];
  }> {
    this.logger.log(`Fetching tasks - lastUpdated: ${lastUpdated}, managerId: ${managerId}`);
    try {
      const tasksLastUpdatedAt = await this.tasksRepository.max('updatedAt', {
        paranoid: false,
      });

      const whereClause: any = {};
      if (lastUpdated) {
        whereClause.updatedAt = {
          [Op.gt]: new Date(lastUpdated),
        };
      }

      if (managerId) {
        whereClause.managerId = managerId;
      }

      let reassignments: TaskReassignments[] = [];
      if (lastUpdated && managerId) {
        reassignments = await this.taskReassignmentsRepository.findAll({
          where: {
            oldManagerId: managerId,
            reassignedAt: {
              [Op.gt]: new Date(lastUpdated),
            },
          },
          include: [
            {
              model: Tasks,
              paranoid: false,
            },
          ],
        });
      }

      const options: any = {
        where: whereClause
      };

      if (lastUpdated) {
        options.paranoid = false;
      }

      const tasks = await this.tasksRepository.findAll(options);

      return {
        tasks,
        lastUpdatedAt: tasksLastUpdatedAt
          ? (tasksLastUpdatedAt as Date).toISOString()
          : null,
        reassignments,
      };
    } catch (error) {
      this.logger.error('Error fetching tasks', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async findOne(taskId: number): Promise<Tasks> {
    const task = await this.tasksRepository.findOne({
      where: { taskId },
      include: [
        {
          model: Users,
          as: 'manager',
          attributes: { exclude: ['password'] },
        },
      ],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return task;
  }

  async update(
    taskId: number,
    updateTaskDto: TaskDto,
    updatingManagerId: number,
  ): Promise<Tasks> {
    this.logger.log(`Updating task with ID: ${taskId}, updating manager ID: ${updatingManagerId}`);
    try {
      const task = await this.tasksRepository.findByPk(taskId, {
        include: [{ model: Users, as: 'manager' }],
      });

      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      let oldManagerId;

      // Track manager reassignment
      if (
        updateTaskDto.managerId !== undefined &&
        updateTaskDto.managerId !== task.managerId
      ) {

        const newManager = await this.usersRepository.findByPk(updateTaskDto.managerId);
        if (!newManager) {
          throw new NotFoundException(`Manager with ID ${updateTaskDto.managerId} not found`);
        }

        await this.taskReassignmentsRepository.create({
          taskId,
          oldManagerId: task.managerId,
          newManagerId: newManager.userId,
        });
        oldManagerId = task.managerId;
      }

      const { dueDate, ...rest } = updateTaskDto;
      const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

      if (parsedDueDate !== undefined) {
        task.dueDate = parsedDueDate;
      }
      Object.assign(task, rest);

      task.managerId = updateTaskDto.managerId;
      await task.save();

      const updatedTask = await this.findOne(taskId);

      if (updatedTask.managerId) {
        this.appGateway.server
          .to(`manager_${updatedTask.managerId}`)
          .emit('task_updated', { payload: updatedTask });
      }

      if (oldManagerId) {
        this.appGateway.server
          .to(`manager_${oldManagerId}`)
          .emit('task_reassigned', { payload: updatedTask });
      }

      this.appGateway.server
        .to('admin')
        .emit('task_updated', { payload: updatedTask });

      return updatedTask;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error updating task ID: ${taskId}`, error);
      throw new Error('Failed to update task');
    }
  }

  async remove(taskId: number): Promise<void> {
    this.logger.log(`Deleting task with ID: ${taskId}`);
    try {
      const task = await this.tasksRepository.findByPk(taskId);

      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      const managerId = task.managerId;

      await this.tasksRepository.destroy({
        where: { taskId },
      });

      if (managerId) {
        this.appGateway.server
          .to(`manager_${managerId}`)
          .emit('task_deleted', { payload: { taskId } });
      }

      this.appGateway.server
        .to('admin')
        .emit('task_deleted', { payload: { taskId } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error deleting task ID: ${taskId}`, error);
      throw new Error('Failed to delete task');
    }
  }
}
