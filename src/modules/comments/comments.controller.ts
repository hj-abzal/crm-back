import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Comments } from './comments.model';
import { CommentsService } from './comments.service';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';
import { CreateCommentDto } from './create-comment.dto';

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getAllComments(): Promise<Comments[]> {
    try {
      return await this.commentsService.getAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while fetching comments',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while fetching all comments. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Req() request: ExpressGuarded,
    @Body() commentsDto: CreateCommentDto,
  ): Promise<Comments> {
    try {
      return await this.commentsService.create({
        ...commentsDto,
        managerId: request.user.userId,
      });
    } catch (error) {
      this.logger.error('Error creating comment', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create comment. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async updateComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Req() request: ExpressGuarded,
    @Body() updateDto: CreateCommentDto,
  ): Promise<Comments> {
    try {
      return await this.commentsService.update(commentId, {
        ...updateDto,
        managerId: request.user.userId,
      });
    } catch (error) {
      this.logger.error(`Error updating comment ID: ${commentId}`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update comment. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
  ): Promise<{ message: string }> {
    try {
      await this.commentsService.delete(commentId);
      return { message: `Comment with id ${commentId} has been deleted.` };
    } catch (error) {
      this.logger.error(`Error deleting comment ID: ${commentId}`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete comment. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
