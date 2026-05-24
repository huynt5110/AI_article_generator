export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

export interface UploadResponse {
  uploadId: string;
  jobId: string;
  status: string;
}

export interface UploadError {
  message: string;
}
