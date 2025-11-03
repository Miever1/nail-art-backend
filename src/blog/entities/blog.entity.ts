import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'int', default: 0 })
  likes: number;
}