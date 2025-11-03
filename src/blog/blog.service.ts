import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogPost } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepo: Repository<BlogPost>,
  ) {}

   create() {
    return 'This action adds a new blog';
  }

  async findAll() {
    return this.blogRepo.find({
      order: { created_at: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.blogRepo.findOne({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.blogRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('The blog post does not exist');
    return post;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    await this.blogRepo.update(id, updateBlogDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.blogRepo.delete(id);
    return `This action removes a #${id} blog`;
  }
  
  private likedMap = new Map<string, Set<number>>();

  async like(slug: string, userId?: number) {
    const post = await this.blogRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('The blog post does not exist');
    if (!userId) throw new ForbiddenException('You must login to like');

    if (!this.likedMap.has(slug)) this.likedMap.set(slug, new Set());
    const userLikes = this.likedMap.get(slug)!;

    if (userLikes.has(userId)) {
      return { liked: true, likes: post.likes ?? 0, message: 'Already liked' };
    }

    userLikes.add(userId);

    await this.blogRepo.increment({ id: post.id }, 'likes', 1);
    const { likes } = await this.blogRepo.findOneOrFail({
      where: { id: post.id },
      select: ['likes'],
    });

    return { liked: true, likes };
  }

  async unlike(slug: string, userId?: number) {
    const post = await this.blogRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('The blog post does not exist');
    if (!userId) throw new ForbiddenException('You must login to unlike');

    if (!this.likedMap.has(slug)) this.likedMap.set(slug, new Set());
    const userLikes = this.likedMap.get(slug)!;

    if (!userLikes.has(userId)) {
      return { liked: false, likes: post.likes ?? 0, message: 'Not liked yet' };
    }

    userLikes.delete(userId);

    await this.blogRepo.decrement({ id: post.id }, 'likes', 1);
    const { likes } = await this.blogRepo.findOneOrFail({
      where: { id: post.id },
      select: ['likes'],
    });

    return { liked: false, likes: Math.max(0, likes) };
  }


}
