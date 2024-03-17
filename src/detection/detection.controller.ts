import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from 'buffer';
import { DetectionService } from './detection.service';

@Controller('detection')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  getHello(@UploadedFile() image: File): any {
    return this.detectionService.objectDetection(image);
  }
}
