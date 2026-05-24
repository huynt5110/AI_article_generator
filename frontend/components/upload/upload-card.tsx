'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadDocument } from '@/hooks/mutations/use-upload-document';
import { UploadDropzone } from './upload-dropzone';
import { UploadProgress } from './upload-progress';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadStatus } from '@/types/upload.types';
import { Loader2 } from 'lucide-react';

export function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  const uploadMutation = useUploadDocument();

  const validateFile = (fileToValidate: File): boolean => {
    // Check extension and MIME type loosely
    const isDocx = fileToValidate.name.toLowerCase().endsWith('.docx') ||
      fileToValidate.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isDocx) {
      setErrorMessage('Only .docx files are supported.');
      return false;
    }

    // Check size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileToValidate.size > maxSize) {
      setErrorMessage('File size exceeds 10MB limit.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setErrorMessage('');
    setStatus('idle');
    setProgress(0);

    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setFile(null);
      }
    } else {
      setFile(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');
    setProgress(0);

    uploadMutation.mutate(
      {
        file,
        onProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      },
      {
        onSuccess: () => {
          setStatus('success');
          // Brief delay to show 100% success state before redirect
          setTimeout(() => {
            router.push('/articles');
          }, 1500);
        },
        onError: (error: any) => {
          setStatus('error');
          setErrorMessage(error?.response?.data?.message || 'Upload failed. Please try again.');
          setProgress(0);
        },
      }
    );
  };

  const isUploading = status === 'uploading';
  const isSuccess = status === 'success';

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="pt-6 space-y-4">
        <UploadDropzone
          file={file}
          onFileSelect={handleFileSelect}
          disabled={isUploading || isSuccess}
        />

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800">
            <AlertDescription>Upload successful! Your draft is being processed. Redirecting...</AlertDescription>
          </Alert>
        )}

        {(isUploading || isSuccess) && progress > 0 && (
          <UploadProgress progress={progress} />
        )}
      </CardContent>
      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 border-t px-6 py-4">
        <div className="flex justify-between w-full items-center">
          <p className="text-sm text-zinc-500">
            Make sure your document is well-formatted.
          </p>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || isSuccess}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isSuccess ? (
              'Success'
            ) : (
              'Upload Notes'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
