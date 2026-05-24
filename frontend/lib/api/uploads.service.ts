import { apiClient } from './client';
import { UploadResponse } from '@/types/upload.types';
import { AxiosProgressEvent } from 'axios';

export const uploadsService = {
  uploadDocument: async (
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },
};
