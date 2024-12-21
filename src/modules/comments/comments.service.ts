import { Injectable, NotFoundException } from '@nestjs/common';
import { Comments } from './comments.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCommentFullDto } from './create-comment.dto'; // Dto that includes managerId

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comments)
    private readonly commentsRepository: typeof Comments,
  ) {}

  async getAll(): Promise<Comments[]> {
    return this.commentsRepository.findAll();
  }

  async create(commentDto: CreateCommentFullDto): Promise<Comments> {
    return this.commentsRepository.create(commentDto);
  }

  async update(
    commentId: number,
    updateDto: CreateCommentFullDto,
  ): Promise<Comments> {
    const [rowsUpdated, [updatedComment]] =
      await this.commentsRepository.update(updateDto, {
        where: { commentId },
        returning: true, // so we get updated record(s) back
      });

    if (rowsUpdated === 0) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return updatedComment;
  }

  async delete(commentId: number): Promise<void> {
    const comment = await this.commentsRepository.findByPk(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    await comment.destroy();
  }
}
