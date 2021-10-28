import { registerAs } from '@nestjs/config';

export default registerAs('attachment', () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  expirationTime: +process.env.PRESIGNED_EXPIRES_IN,
}));
