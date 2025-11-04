import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { BlogPost } from '../entities/blog.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
const sanitizeHtml = require('sanitize-html');

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
    @InjectRepository(BlogPost) private readonly posts: Repository<BlogPost>,
  ) {}

  async create(slug: string, authorId: number | null, dto: CreateCommentDto) {
    const post = await this.posts.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('The blog post does not exist');

    let parent: Comment | null = null;
    if (dto.parentId) {
      parent = await this.repo.findOne({ where: { id: dto.parentId, post: { id: post.id } } });
      if (!parent) throw new BadRequestException('The parent comment does not exist or does not belong to this post');
    }

    const clean = sanitizeHtml(dto.content, {
      allowedTags: ['b','i','em','strong','a','code','pre','blockquote','ul','ol','li','p','br'],
      allowedAttributes: { a: ['href','title','target','rel'] },
      allowedSchemes: ['http','https','mailto'],
      transformTags: { a: (t,a)=>({ tagName:'a', attribs:{...a, rel:'noopener noreferrer'} })},
    });

    const comment = this.repo.create({
      post,
      author: authorId ? ({ id: authorId }) : null,
      parent,
      content: clean,
    });
    return this.repo.save(comment);
  }

  async list(slug: string, page = 1, pageSize = 20) {
    const post = await this.posts.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('The blog post does not exist');

    const [roots, total] = await this.repo.findAndCount({
      where: { post: { id: post.id }, parent: IsNull() },
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['author'],
      select: { author: { id: true, name: true, email: true }},
    });

    const rootIds = roots.map(r => r.id);
    let replies: Comment[] = [];
    if (rootIds.length) {
      replies = await this.repo.createQueryBuilder('c')
        .leftJoinAndSelect('c.author', 'author')
        .where('c.postId = :postId', { postId: post.id })
        .andWhere('c.parentId IN (:...ids)', { ids: rootIds })
        .orderBy('c.created_at', 'ASC')
        .getMany();
    }
    const map: Record<number, Comment[]> = {};
    for (const r of replies) {
      const pid = r.parent?.id;
      map[pid] = map[pid] || [];
      map[pid].push(r);
    }
    return { page, pageSize, total, data: roots.map(r => ({ ...r, replies: map[r.id] ?? [] })) };
  }

  async update(id: number, userId: number, dto: UpdateCommentDto) {
    const c = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!c) throw new NotFoundException('The comment does not exist');
    if (!c.author || c.author.id !== userId) throw new ForbiddenException('You do not have permission to edit this comment');

    c.content = sanitizeHtml(dto.content, {
      allowedTags: ['b','i','em','strong','a','code','pre','blockquote','ul','ol','li','p','br'],
      allowedAttributes: { a: ['href','title','target','rel'] },
      allowedSchemes: ['http','https','mailto'],
    });
    return this.repo.save(c);
  }

  async remove(id: number, userId: number) {
    const c = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!c) throw new NotFoundException('The comment does not exist');
    if (!c.author || c.author.id !== userId) throw new ForbiddenException('You do not have permission to delete this comment');
    await this.repo.softDelete(id);
    return { ok: true };
  }
}