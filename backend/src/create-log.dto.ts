// backend/src/create-log.dto.ts
import { IsString, IsOptional, IsInt, IsDateString, IsArray } from 'class-validator';

export class CreateLogDto {
  @IsDateString() // บังคับว่าเป็น Format วันที่ (RFC3339)
  @IsOptional()
  timestamp: string;

  @IsString()
  @IsOptional()
  tenant?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  event_type?: string;

  @IsInt()
  @IsOptional()
  severity?: number;

  @IsString()
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  src_ip?: string;

  @IsString()
  @IsOptional()
  dst_ip?: string;

  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  raw?: string;
  
  // รับข้อมูลอื่นๆ ที่อาจจะส่งมาเพิ่ม
  @IsOptional()
  metadata?: any; 
}