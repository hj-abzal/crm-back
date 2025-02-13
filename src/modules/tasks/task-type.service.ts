import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TaskType } from './task-type.model';
import { CreateTaskTypeDto } from './dto/create-task-type.dto';
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class TaskTypeService {
  constructor(
    @InjectModel(TaskType)
    private taskTypeModel: typeof TaskType,
    private readonly appGateway: AppGateway,
  ) {}

  async create(dto: CreateTaskTypeDto): Promise<TaskType> {
    const taskType = await this.taskTypeModel.create(dto);
    await this.appGateway.server.emit('task_type_created', taskType);
    return taskType;
  }

  async findAll(): Promise<TaskType[]> {
    return await this.taskTypeModel.findAll();
  }

  async findOne(id: number): Promise<TaskType> {
    return await this.taskTypeModel.findByPk(id);
  }

  async update(id: number, dto: CreateTaskTypeDto): Promise<TaskType> {
    const [, [updatedTaskType]] = await this.taskTypeModel.update(dto, {
      where: { id },
      returning: true,
    });
    await this.appGateway.server.emit('task_type_updated', updatedTaskType);
    return updatedTaskType;
  }

  async remove(id: number): Promise<TaskType> {
    const taskType = await this.findOne(id);
    await this.taskTypeModel.destroy({ where: { id } });
    await this.appGateway.server.emit('task_type_deleted', taskType);
    return taskType;
  }
} 