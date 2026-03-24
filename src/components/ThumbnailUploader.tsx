import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { css } from 'styled-system/css';
import { uploadPostImage, type UploadResult } from '@/services/posts.service';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ThumbnailUploaderProps {
  value: string | null;
  onChange: (value: UploadResult | null) => void;
}

export function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`지원하지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')} 만 허용)`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadPostImage(file);
      onChange(result);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div>
      <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', mb: '1' })}>
        썸네일 이미지 <span className={css({ color: 'gray.400', fontWeight: 'normal' })}>(선택)</span>
      </label>

      {value ? (
        <div className={css({ position: 'relative', borderRadius: 'lg', overflow: 'hidden', border: '1px solid', borderColor: 'gray.200' })}>
          <img
            src={value}
            alt="썸네일 미리보기"
            className={css({ w: 'full', h: '200px', objectFit: 'cover', display: 'block' })}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className={css({
              position: 'absolute',
              top: '2',
              right: '2',
              w: '8',
              h: '8',
              borderRadius: 'full',
              bg: 'rgba(0,0,0,0.55)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              _hover: { bg: 'rgba(0,0,0,0.75)' },
            })}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={css({
            border: '2px dashed',
            borderColor: isDragging ? 'brand.400' : 'gray.300',
            borderRadius: 'lg',
            py: '10',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2',
            cursor: 'pointer',
            bg: isDragging ? 'brand.50' : 'gray.50',
            transition: 'all 0.15s',
            _hover: { borderColor: 'brand.400', bg: 'brand.50' },
          })}
        >
          {isUploading ? (
            <div className={css({ color: 'gray.400', fontSize: 'sm' })}>업로드 중...</div>
          ) : (
            <>
              <ImagePlus size={28} className={css({ color: 'gray.400' })} />
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
                클릭하거나 이미지를 드래그하세요
              </p>
              <p className={css({ fontSize: 'xs', color: 'gray.400' })}>JPG, PNG, WEBP, GIF (최대 5MB)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={handleChange}
        className={css({ display: 'none' })}
      />
    </div>
  );
}
