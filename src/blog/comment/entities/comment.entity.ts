import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index
} from 'typeorm';
import { BlogPost } from '../../entities/blog.entity';
import { User } from '../../../users/user.entity';

@Entity('blog_comments')
@Index(['post', 'created_at'])
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BlogPost, { onDelete: 'CASCADE' })
  post: BlogPost;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  author: User | null;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  parent: Comment | null;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deleted_at?: Date | null;
}