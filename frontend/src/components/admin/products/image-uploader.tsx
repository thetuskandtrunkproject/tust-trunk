import { ImagePlus, X } from 'lucide-react'

interface ImageUploaderProps {
  existingImages: string[]
  newFiles: File[]
  onAddFiles: (files: File[]) => void
  onRemoveExisting: (url: string) => void
  onRemoveNewFile: (index: number) => void
}

export function ImageUploader({ existingImages, newFiles, onAddFiles, onRemoveExisting, onRemoveNewFile }: ImageUploaderProps) {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allFiles = Array.from(e.target.files)
      const validFiles = allFiles.filter(f => f.type === 'image/webp' || f.name.toLowerCase().endsWith('.webp'))
      
      if (validFiles.length < allFiles.length) {
        alert("Only WEBP format is supported. Other formats were ignored.")
      }
      
      if (validFiles.length > 0) {
        onAddFiles(validFiles)
      }
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-ink">Media</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {existingImages.map((img, idx) => (
          <div key={`exist-${idx}`} className="relative aspect-[3/4] bg-cloud border border-ink/10 rounded-xl overflow-hidden group">
            <img src={img} alt={`Product view ${idx + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button"
                onClick={() => onRemoveExisting(img)}
                className="w-10 h-10 bg-white text-rust rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {newFiles.map((file, idx) => (
          <div key={`new-${idx}`} className="relative aspect-[3/4] bg-cloud border-2 border-sky/50 rounded-xl overflow-hidden group">
            <img src={URL.createObjectURL(file)} alt={`New upload ${idx + 1}`} className="w-full h-full object-cover opacity-70" />
            <div className="absolute top-2 right-2 bg-sky text-white text-[10px] px-2 py-0.5 rounded-full font-medium">NEW</div>
            <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button"
                onClick={() => onRemoveNewFile(idx)}
                className="w-10 h-10 bg-white text-rust rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <label className="cursor-pointer aspect-[3/4] border-2 border-dashed border-ink/20 rounded-xl flex flex-col items-center justify-center text-ink/40 hover:text-sky hover:border-sky hover:bg-sky/5 transition-colors group">
          <input type="file" multiple accept="image/webp" onChange={handleFileChange} className="hidden" />
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:bg-sky group-hover:text-white transition-colors">
            <ImagePlus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Add Image</span>
        </label>
      </div>
      <p className="text-xs text-ink/50">Used for product galleries. First image is the thumbnail.</p>
    </div>
  )
}
