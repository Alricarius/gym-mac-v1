import { IsUUID } from 'class-validator';

export class UpdateBranchDto {
  @IsUUID()
  branchId: string;
}
