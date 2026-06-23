import { useState } from "react"
import { ImagePlus, X } from "lucide-react"

// Demo image upload area. Stores object URLs locally only (no real upload).
export default function ImageUploader({ max = 5 }) {
  const [images, setImages] = useState([])

  const onPick = (e) => {
    const files = Array.from(e.target.files || [])
    const urls = files.map((f) => URL.createObjectURL(f))
    setImages((prev) => [...prev, ...urls].slice(0, max))
  }

  const remove = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-card text-muted-foreground ring-1 ring-border">
        <ImagePlus size={22} />
        <span className="text-xs font-medium">
          {images.length}/{max}
        </span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
      </label>

      {images.map((src, i) => (
        <div key={i} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
          <img src={src || "/placeholder.svg"} alt={`업로드 이미지 ${i + 1}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="이미지 삭제"
            className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-dark/80 text-dark-foreground"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
