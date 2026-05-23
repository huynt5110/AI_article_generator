import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageProvider } from './storage.interface';

@Injectable()
export class S3Service implements StorageProvider {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  public readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('s3.region');
    const accessKeyId = this.configService.getOrThrow<string>('s3.accessKeyId');
    const secretAccessKey = this.configService.getOrThrow<string>('s3.secretAccessKey');
    this.bucket = this.configService.getOrThrow<string>('s3.bucket');

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, key: string, mimeType: string): Promise<void> {
    this.logger.debug(`Uploading file directly to S3 key: ${key}`);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);
  }
}
