import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Get,
  Param,
  Res,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Response } from 'express';
import { existsSync, unlinkSync } from 'fs';
import { join, basename } from 'path';

// Helper function to sanitize filename and prevent path traversal
function sanitizeFilename(filename: string): string | null {
  // Get only the base filename, removing any path components
  const sanitized = basename(filename);
  // Reject if filename contains suspicious patterns
  if (
    sanitized !== filename ||
    filename.includes('..') ||
    filename.includes('\\') ||
    filename.includes('/')
  ) {
    return null;
  }
  // Only allow alphanumeric, dash, underscore, and dot
  if (!/^[a-zA-Z0-9_.-]+$/.test(sanitized)) {
    return null;
  }
  return sanitized;
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/api/upload/file/${file.filename}`,
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return {
      message: `${files.length} files uploaded successfully`,
      files: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/api/upload/file/${file.filename}`,
      })),
    };
  }

  @Post('product')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  @UseInterceptors(FileInterceptor('image'))
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image uploaded');
    }
    return {
      message: 'Product image uploaded successfully',
      imageUrl: `/api/upload/file/${file.filename}`,
      filename: file.filename,
    };
  }

  @Post('service')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  @UseInterceptors(FileInterceptor('image'))
  uploadServiceImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image uploaded');
    }
    return {
      message: 'Service image uploaded successfully',
      imageUrl: `/api/upload/file/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get('file/:filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const sanitized = sanitizeFilename(filename);
    if (!sanitized) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    const filePath = join(process.cwd(), 'uploads', sanitized);
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }

  @Delete('file/:filename')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  deleteFile(@Param('filename') filename: string) {
    const sanitized = sanitizeFilename(filename);
    if (!sanitized) {
      throw new BadRequestException('Invalid filename');
    }
    const filePath = join(process.cwd(), 'uploads', sanitized);
    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    unlinkSync(filePath);
    return { message: 'File deleted successfully' };
  }
}
