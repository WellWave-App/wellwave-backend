import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export const imageFileValidator = new ParseFilePipe({
  validators: [
    new FileTypeValidator({
      fileType: /^image\/(jpeg|png|jpg|gif)$/i,
    }),
    new MaxFileSizeValidator({
      maxSize: 3 * 1024 * 1024,
      message: 'File must be smaller than or equal to 3 MB',
    }),
  ],
  fileIsRequired: false,
});
