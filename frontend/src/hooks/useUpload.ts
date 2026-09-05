import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadPaper } from '../services/api';
import useWorkspaceStore from '../store/workspaceStore';
import toast from 'react-hot-toast';
import type { Paper } from '../types';

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const addPaper = useWorkspaceStore((s) => s.addPaper);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadPaper(file, setProgress),
    onSuccess: (paper: Paper) => {
      addPaper(paper);
      toast.success(`"${paper.original_name}" uploaded successfully`);
      setProgress(0);
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
      setProgress(0);
    },
  });

  return {
    upload: mutation.mutate,
    isUploading: mutation.isPending,
    progress,
    error: mutation.error,
  };
}

export default useUpload;
