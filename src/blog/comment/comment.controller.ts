import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Req
} from '@nestjs/common';
import { Request } from 'express';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('blog')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 列出某文章的评论（分页）
  @Get(':slug/comments')
  list(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.commentService.list(
      slug,
      Number(page) || 1,
      Number(pageSize) || 20,
    );
  }

  // 新增评论（需要登录）
  @UseGuards(JwtAuthGuard)
  @Post(':slug/comments')
  create(
    @Param('slug') slug: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id ?? null;
    // Service 需要 3 个参数：slug、authorId、dto
    return this.commentService.create(slug, userId, createCommentDto);
  }

  // 更新评论（需要登录 & 本人）
  @UseGuards(JwtAuthGuard)
  @Patch('comments/:id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.commentService.update(+id, userId, updateCommentDto);
  }

  // 删除评论（需要登录 & 本人）
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id;
    return this.commentService.remove(+id, userId);
  }
}