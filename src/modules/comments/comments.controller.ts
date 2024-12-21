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
} from '@nestjs/common';
import { Comments } from './comments.model';
import { CommentsService } from './comments.service';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';
import { CreateCommentDto } from './create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllComments(): Promise<Comments[]> {
    return this.commentsService.getAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() request: ExpressGuarded,
    @Body() commentsDto: CreateCommentDto,
  ): Promise<Comments> {
    return this.commentsService.create({
      ...commentsDto,
      managerId: request.user.userId,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Req() request: ExpressGuarded,
    @Body() updateDto: CreateCommentDto,
  ): Promise<Comments> {
    return this.commentsService.update(commentId, {
      ...updateDto,
      managerId: request.user.userId,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
  ): Promise<{ message: string }> {
    await this.commentsService.delete(commentId);
    return { message: `Comment with id ${commentId} has been deleted.` };
  }
}
