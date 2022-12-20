import { Controller, Res, Get, Post, UploadedFile, UseInterceptors, BadRequestException, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName:string
  ){

    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path)
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: {fileSize:1000}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File) {

    if(!file) throw new BadRequestException('Make sure thath the file is a image')

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return {
      secureUrl
    };
  }

}
