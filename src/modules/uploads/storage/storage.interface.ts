export interface StorageProvider {
  uploadFile(fileBuffer: Buffer, key: string, mimeType: string): Promise<void>;
}
