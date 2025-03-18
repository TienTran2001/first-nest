import { IsNotEmpty } from "class-validator";


export class CreateUserDto {
  @IsNotEmpty({ message: "Name is required"})
}