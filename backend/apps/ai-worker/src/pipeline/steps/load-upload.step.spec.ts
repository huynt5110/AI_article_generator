import { LoadUploadStep } from './load-upload.step';
import { ExtractionContext } from '../extraction.context';

describe('LoadUploadStep', () => {
  let step: LoadUploadStep;
  let prismaServiceMock: any;
  let s3ServiceMock: any;

  beforeEach(() => {
    prismaServiceMock = {
      upload: { findUnique: jest.fn() },
      extractionJob: { update: jest.fn() },
    };
    s3ServiceMock = {
      downloadFile: jest.fn(),
    };
    step = new LoadUploadStep(prismaServiceMock, s3ServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  it('should have the correct step name', () => {
    expect(step.name).toBe('load-upload');
  });

  it('should load upload, set job status, and download file', async () => {
    const mockUpload = {
      id: 'upload-1',
      s3Key: 'uploads/user-1/upload-1/original.docx',
      bucket: 'my-bucket',
    };
    prismaServiceMock.upload.findUnique.mockResolvedValue(mockUpload);
    prismaServiceMock.extractionJob.update.mockResolvedValue({});
    s3ServiceMock.downloadFile.mockResolvedValue(Buffer.from('file-content'));

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    await step.execute(context);

    expect(context.upload).toEqual(mockUpload);
    expect(context.fileBuffer).toEqual(Buffer.from('file-content'));
    expect(prismaServiceMock.extractionJob.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: expect.objectContaining({ status: 'PARSING' }),
    });
    expect(s3ServiceMock.downloadFile).toHaveBeenCalledWith(
      'uploads/user-1/upload-1/original.docx',
      'my-bucket',
    );
  });

  it('should throw if upload is not found', async () => {
    prismaServiceMock.upload.findUnique.mockResolvedValue(null);

    const context = new ExtractionContext({ uploadId: 'missing', jobId: 'job-1' });

    await expect(step.execute(context)).rejects.toThrow('Upload not found: missing');
  });

  it('should propagate S3 download errors', async () => {
    prismaServiceMock.upload.findUnique.mockResolvedValue({
      id: 'upload-1',
      s3Key: 'key',
      bucket: 'bucket',
    });
    prismaServiceMock.extractionJob.update.mockResolvedValue({});
    s3ServiceMock.downloadFile.mockRejectedValue(new Error('S3 timeout'));

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });

    await expect(step.execute(context)).rejects.toThrow('S3 timeout');
  });
});
