import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog.entity';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost]), CommentModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}