import { IsString, IsNotEmpty } from 'class-validator';

export class TaskActor {
  @IsNotEmpty()
  @IsString()
  public email: string;
}
