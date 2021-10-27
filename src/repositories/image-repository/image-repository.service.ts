import { BadGatewayException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class ImageRepositoryService {
  s3: AWS.S3;
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
  }

  async uploadImage(imgName, image) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imgName, // File name you want to save as in S3
      Body: image,
    };
    this.s3.upload(params, (err, data) => {
      if (err) {
        throw new BadGatewayException(`${err.message}`);
      }
      console.log(`File upload succesfully. ${data.location}`);
      return data.location;
    });
  }
}
