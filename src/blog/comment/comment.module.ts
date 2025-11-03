import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { BlogPost } from '../entities/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, BlogPost])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}