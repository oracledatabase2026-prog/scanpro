import { useCallback, useRef, useState } from 'react';

export function useDropzone(onFiles: (files: File[]) => void, accept: string[]) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAccepted = useCallback(
    (file: File) => accept.some((a) => file.type === a || file.name.toLowerCase().endsWith(a)),
    [accept]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(isAccepted);
      if (files.length) onFiles(files);
    },
    [onFiles, isAccepted]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter(isAccepted);
      if (files.length) onFiles(files);
      e.target.value = '';
    },
    [onFiles, isAccepted]
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  return { isDragging, inputRef, onDrop, onDragOver, onDragLeave, onInputChange, openPicker };
}
