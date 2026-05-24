import { UploadCard } from '@/components/upload/upload-card';

export const metadata = {
  title: 'Upload Notes - Travel AI',
  description: 'Upload your rough travel notes to generate a structured editorial story.',
};

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Travel Notes</h1>
        <p className="text-zinc-500 text-lg">
          Upload a .docx file containing your rough travel notes. We'll automatically extract the details and prepare a structured editorial draft.
        </p>
      </div>

      <UploadCard />
    </div>
  );
}
