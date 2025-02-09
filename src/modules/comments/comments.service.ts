import { Injectable, NotFoundException, Logger, HttpException } from '@nestjs/common';
import { Comments } from './comments.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCommentFullDto } from './create-comment.dto'; // Dto that includes managerId
import { Users } from '../users/users.model';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectModel(Comments)
    private readonly commentsRepository: typeof Comments,
    @InjectModel(Users)
    private readonly usersRepository: typeof Users,
  ) {}

  async getAll(): Promise<Comments[]> {
    this.logger.log('Fetching all comments');
    try {
      return await this.commentsRepository.findAll({
        include: [
          {
            model: Users,
            as: 'manager',
            attributes: { exclude: ['password'] },
          },
        ],
      });
    } catch (error) {
      this.logger.error('Error fetching all comments', error);
      throw new Error('Failed to fetch comments');
    }
  }

  async create(commentDto: CreateCommentFullDto): Promise<Comments> {
    this.logger.log('Creating new comment');
    try {
      const manager = await this.usersRepository.findOne({
        where: { userId: commentDto.managerId },
      });
      
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${commentDto.managerId} does not exist`);
      }

      const comment = await this.commentsRepository.create(commentDto);
      return this.findOne(comment.commentId);
    } catch (error) {
      this.logger.error('Error creating comment', error);
      if (error instanceof HttpException) throw error;
      throw new Error('Failed to create comment');
    }
  }

  async findOne(commentId: number): Promise<Comments> {
    const comment = await this.commentsRepository.findOne({
      where: { commentId },
      include: [
        {
          model: Users,
          as: 'manager',
          attributes: { exclude: ['password'] },
        },
      ],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return comment;
  }

  async update(
    commentId: number,
    updateDto: CreateCommentFullDto,
  ): Promise<Comments> {
    this.logger.log(`Updating comment with ID: ${commentId}`);
    try {
      const comment = await this.commentsRepository.findByPk(commentId);

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      const [rowsUpdated] = await this.commentsRepository.update(updateDto, {
        where: { commentId },
      });

      if (rowsUpdated === 0) {
        throw new NotFoundException(`Comment with id ${commentId} not found`);
      }

      return this.findOne(commentId);
    } catch (error) {
      this.logger.error(`Error updating comment ID: ${commentId}`, error);
      if (error instanceof HttpException) throw error;
      throw new Error('Failed to update comment');
    }
  }

  async delete(commentId: number): Promise<void> {
    this.logger.log(`Deleting comment with ID: ${commentId}`);
    try {
      const comment = await this.commentsRepository.findByPk(commentId);

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      await comment.destroy();
    } catch (error) {
      this.logger.error(`Error deleting comment ID: ${commentId}`, error);
      if (error instanceof HttpException) throw error;
      throw new Error('Failed to delete comment');
    }
  }
}
