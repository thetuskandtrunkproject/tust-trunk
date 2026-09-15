import { ImagePlus, X } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  
  // Mock image upload by simply generating a random unsplash url
  // In reality, this would upload to S3/Firebase and get back a URL
  const handleAddMockImage = () => {
    const newImage = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?q=80&w=800&fit=crop`
    onChange([...images, newImage])
  }

  const handleRemove = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-ink">Media</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-[3/4] bg-cloud border border-ink/10 rounded-xl overflow-hidden group">
            <img src={img} alt={`Product view ${idx + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button"
                onClick={() => handleRemove(idx)}
                className="w-10 h-10 bg-white text-rust rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddMockImage}
          className="aspect-[3/4] border-2 border-dashed border-ink/20 rounded-xl flex flex-col items-center justify-center text-ink/40 hover:text-sky hover:border-sky hover:bg-sky/5 transition-colors group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:bg-sky group-hover:text-white transition-colors">
            <ImagePlus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Add Image</span>
        </button>
      </div>
      <p className="text-xs text-ink/50">Used for product galleries. First image is the thumbnail.</p>
    </div>
  )
}
