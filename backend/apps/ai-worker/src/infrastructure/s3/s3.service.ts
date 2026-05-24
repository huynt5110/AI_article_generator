import { Injectable, Logger, Inject } from '@nestjs/common';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import s3Config from '../../config/s3.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;

  constructor(
    @Inject(s3Config.KEY)
    private readonly s3Configuration: ConfigType<typeof s3Config>,
  ) {
    this.s3Client = new S3Client({
      region: this.s3Configuration.region as string,
      credentials: {
        accessKeyId: this.s3Configuration.accessKeyId as string,
        secretAccessKey: this.s3Configuration.secretAccessKey as string,
      },
    });
  }

  async downloadFile(key: string, bucket: string): Promise<Buffer> {
    this.logger.debug(`Downloading S3 object: ${bucket}/${key}`);

    const response = await this.s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );

    if (!response.Body) {
      throw new Error(`Empty S3 object for key: ${key}`);
    }

    return Buffer.from(await response.Body.transformToByteArray());
  }
}
