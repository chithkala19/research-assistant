import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

export default function DropZone() {
  const { upload, isUploading, progress } = useUpload();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => upload(file));
    },
    [upload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024,
    disabled: isUploading,
  });

  return (
    <div className="space-y-3">
      <div {...getRootProps()}>
        <motion.div
          whileHover={{ scale: isUploading ? 1 : 1.01 }}
          className={`
            relative cursor-pointer border-2 border-dashed rounded-2xl p-10
            transition-all duration-300 text-center
            ${isDragActive
              ? 'border-accent-primary bg-accent-primary/10 glow-blue'
              : 'border-border-subtle hover:border-accent-primary/50 hover:bg-bg-elevated/50'
            }
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
        <input {...getInputProps()} />

        <motion.div
          animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center gap-4"
        >
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center
            ${isDragActive
              ? 'bg-accent-primary/20'
              : 'bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10'
            }
          `}>
            {isDragActive ? (
              <FileUp className="w-8 h-8 text-accent-primary animate-bounce" />
            ) : (
              <Upload className="w-8 h-8 text-accent-primary" />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-text-primary mb-1">
              {isDragActive ? 'Drop your PDF here' : 'Upload Research Papers'}
            </p>
            <p className="text-sm text-text-secondary">
              Drag & drop PDF files or <span className="text-accent-primary">browse</span>
            </p>
            <p className="text-xs text-text-muted mt-1">Max file size: 50MB</p>
          </div>
        </motion.div>

        {isUploading && (
          <div className="mt-6">
            <div className="w-full bg-bg-primary rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-text-secondary mt-2">Uploading... {progress}%</p>
          </div>
        )}
      </motion.div>
      </div>

      {fileRejections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20"
        >
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-sm text-error">
            Only PDF files under 50MB are accepted.
          </p>
        </motion.div>
      )}
    </div>
  );
}
