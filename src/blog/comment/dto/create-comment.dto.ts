import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'The content must be at least 1 character long' })
  @MaxLength(5000, { message: 'The content must be at most 5000 characters long' })
  content: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}