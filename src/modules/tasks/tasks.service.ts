import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tasks } from './tasks.model';
import { TaskDto } from './task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Tasks)
    private readonly tasksRepository: typeof Tasks,
  ) {}

  async create(createTaskDto: TaskDto, managerId: number): Promise<Tasks> {
    const { dueDate, ...rest } = createTaskDto;
    const parsedDueDate = dueDate ? new Date(dueDate) : null;

    return await this.tasksRepository.create({
      ...rest,
      dueDate: parsedDueDate || null,
      managerId,
    });
  }

  async findAll(): Promise<Tasks[]> {
    return this.tasksRepository.findAll();
  }

  async findOne(taskId: number): Promise<Tasks> {
    const task = await this.tasksRepository.findByPk(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }
    return task;
  }

  async update(
    taskId: number,
    updateTaskDto: TaskDto,
    managerId: number,
  ): Promise<Tasks> {
    const task = await this.findOne(taskId);

    const { dueDate, ...rest } = updateTaskDto;
    const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

    if (parsedDueDate !== undefined) {
      task.dueDate = parsedDueDate;
    }
    Object.assign(task, rest);

    task.managerId = managerId;

    return task.save();
  }

  async remove(taskId: number): Promise<void> {
    const task = await this.findOne(taskId);

    await task.destroy();
  }
}
