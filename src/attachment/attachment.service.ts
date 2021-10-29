import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { config as configAWS, S3 } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import attachmentConfig from './config/attachment.config';
import { AttachmentDto } from './dto/attachment.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class AttachmentService {
  private readonly s3: S3;

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(attachmentConfig.KEY)
    private readonly configService: ConfigType<typeof attachmentConfig>,
  ) {
    configAWS.update({
      credentials: {
        accessKeyId: configService.accessKeyId,
        secretAccessKey: configService.secretAccessKey,
      },
      region: configService.region,
    });
    this.s3 = new S3();
  }

  async uploadImages(
    productUuid: string,
    type: string,
  ): Promise<AttachmentDto> {
    let extension: string;
    if (type === 'image/png') {
      extension = 'png';
    } else if (type === 'image/jpg') {
      extension = 'jpg';
    } else {
      extension = 'jpeg';
    }

    const findProduct = await this.prismaService.product.findUnique({
      where: {
        uuid: productUuid,
      },
      select: {
        id: true,
      },
    });

    const idProduct = findProduct;

    const attachment = await this.prismaService.attachment.create({
      data: {
        productId: idProduct.id,
        key: nanoid(),
        contentType: type,
        ext: extension,
      },
    });
    const signedUrl = this.s3.getSignedUrl('putObject', {
      Key: attachment.key,
      ContentType: attachment.contentType,
      Bucket: this.configService.bucket,
      Expires: this.configService.expirationTime,
    });
    return plainToClass(AttachmentDto, { signedUrl, ...attachment });
  }

  async getImages(productId: number): Promise<string[]> {
    const attachments = await this.prismaService.attachment.findMany({
      where: { productId },
    });

    const signedUrl = attachments.map((attachment) => {
      const params = {
        Bucket: this.configService.bucket,
        Key: attachment.key,
        Expires: this.configService.expirationTime,
      };
      return this.s3.getSignedUrl('getObject', params);
    });
    return signedUrl;
  }
}
