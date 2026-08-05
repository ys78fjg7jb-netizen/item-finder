import * as React from "react"
import { Layout } from "@/components/layout"
import { useCreateItem } from "@workspace/api-client-react"
import { useLocation } from "wouter"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Camera, MapPin, Tag, Palette, Check, User, BookOpen, CalendarDays, GraduationCap, IdCard, Mail } from "lucide-react"

const SCHOOL_CATEGORIES = [
  "Electronics",
  "Stationery",
  "Clothing / Uniform",
  "Books / Textbooks",
  "Sports Equipment",
  "Backpack / Bag",
  "Water Bottle",
  "Lunchbox",
  "Keys",
  "ID Card / Student Card",
  "Other",
]

const GRADES = [
  "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Staff / Teacher",
  "Other",
]

export default function ReportItem() {
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const [type, setType] = React.useState<"lost" | "found">("lost")
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState<string>("")
  const [imagePreview, setImagePreview] = React.useState<string>("")

  const createItem = useCreateItem()

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setIsUploading(true)
    setUploadError("")
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setImageUrl(data.imageUrl)
    } catch {
      setUploadError("Failed to upload image. Please try again.")
      setImagePreview("")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    createItem.mutate({
      data: {
        type,
        category: fd.get("category") as string,
        brand: (fd.get("brand") as string) || "Unknown",
        color: fd.get("color") as string,
        description: fd.get("description") as string,
        locationDescription: fd.get("locationDescription") as string,
        dateOfLoss: type === "lost" ? (fd.get("dateOfLoss") as string) || undefined : undefined,
        reporterName: fd.get("reporterName") as string,
        reporterContact: fd.get("reporterContact") as string,
        studentId: (fd.get("studentId") as string) || undefined,
        grade: (fd.get("grade") as string) || undefined,
        imageUrl: imageUrl || undefined,
      },
    }, {
      onSuccess: (data) => {
        toast({ title: "Notice Posted", description: "Your item has been added to the school notice board." })
        setLocation(`/items/${data.id}`)
      },
      onError: () => {
        toast({ title: "Error", description: "Could not post the notice. Please check your fields and try again.", variant: "destructive" })
      },
    })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Post a School Notice</h1>
            <p className="text-muted-foreground">
              Provide as much detail as possible to help students and staff identify the item.
            </p>
          </div>

          <Card className="overflow-hidden border-2">
            <CardContent className="p-0">
              {/* Type Toggle */}
              <div className="flex w-full">
                <button
                  type="button"
                  onClick={() => setType("lost")}
                  className={`flex-1 py-6 text-center text-lg font-semibold transition-colors ${type === "lost" ? "bg-destructive/10 text-destructive border-b-2 border-destructive" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border-b-2 border-transparent"}`}
                >
                  I lost something
                </button>
                <button
                  type="button"
                  onClick={() => setType("found")}
                  className={`flex-1 py-6 text-center text-lg font-semibold transition-colors ${type === "found" ? "bg-secondary/10 text-secondary border-b-2 border-secondary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border-b-2 border-transparent"}`}
                >
                  I found something
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

                {/* ── Photo Upload ── */}
                <div className="space-y-3">
                  <Label>Photo <span className="text-muted-foreground font-normal">(optional but highly recommended)</span></Label>
                  <div className="border-2 border-dashed border-input rounded-xl bg-muted/20 relative transition-all hover:bg-muted/40">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[180px]">
                      {imagePreview ? (
                        <div className="relative w-full aspect-video sm:aspect-[21/9] rounded-lg overflow-hidden border shadow-sm">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          {isUploading && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                              <span className="font-medium animate-pulse">Uploading...</span>
                            </div>
                          )}
                          {imageUrl && !isUploading && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-3 shadow-sm text-muted-foreground">
                            <Camera size={24} />
                          </div>
                          <span className="font-medium text-foreground mb-1">Click to upload a photo</span>
                          <span className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</span>
                        </>
                      )}
                    </div>
                  </div>
                  {uploadError && <p className="text-destructive text-sm">{uploadError}</p>}
                </div>

                {/* ── Item Details ── */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-base text-foreground flex items-center gap-2 border-b pb-2">
                    <BookOpen size={16} /> Item Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        name="category"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select a category</option>
                        {SCHOOL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Prominent Color *</Label>
                      <div className="relative">
                        <Palette size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                        <Input id="color" name="color" required placeholder="e.g. Black, Blue, Red" className="pl-9" />
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="brand">Brand / Make <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="relative">
                        <Tag size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                        <Input id="brand" name="brand" placeholder="e.g. Apple, Casio, Nike, Pilot" className="pl-9" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      placeholder={
                        type === "lost"
                          ? "Describe any identifying marks, your name written inside, stickers, damage, or serial numbers..."
                          : "Describe the item clearly. You may leave out one detail so the owner can verify it."
                      }
                      className="min-h-[110px] resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="locationDescription">
                        {type === "lost" ? "Last Seen Location *" : "Where Found *"}
                      </Label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                        <Input
                          id="locationDescription"
                          name="locationDescription"
                          required
                          placeholder={type === "lost" ? "e.g. Room 12, Science Lab, Canteen" : "e.g. Found in Room 5, near the library"}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {type === "lost" && (
                      <div className="space-y-2">
                        <Label htmlFor="dateOfLoss">Date Lost *</Label>
                        <div className="relative">
                          <CalendarDays size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                          <Input
                            id="dateOfLoss"
                            name="dateOfLoss"
                            type="date"
                            required={type === "lost"}
                            max={new Date().toISOString().split("T")[0]}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Student Information ── */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-base text-foreground flex items-center gap-2 border-b pb-2">
                    <User size={16} /> Your Information
                  </h3>
                  <p className="text-sm text-muted-foreground -mt-2">
                    This will be visible to other students and staff so they can contact you.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="reporterName">Full Name *</Label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                        <Input id="reporterName" name="reporterName" required placeholder="e.g. Jamie Lee" className="pl-9" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reporterContact">School Email *</Label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                        <Input
                          id="reporterContact"
                          name="reporterContact"
                          type="email"
                          required
                          placeholder="e.g. jamie@school.edu"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="relative">
                        <IdCard size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                        <Input id="studentId" name="studentId" placeholder="e.g. STU-20045" className="pl-9" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Year / Class <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="relative">
                        <GraduationCap size={15} className="absolute left-3 top-[11px] text-muted-foreground" />
                        <select
                          id="grade"
                          name="grade"
                          className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select your year/class</option>
                          {GRADES.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base h-12"
                  disabled={createItem.isPending || isUploading}
                >
                  {createItem.isPending ? "Posting..." : `Post ${type === "lost" ? "Lost" : "Found"} Notice`}
                </Button>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  )
}
