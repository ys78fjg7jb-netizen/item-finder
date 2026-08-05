import * as React from "react"
import { Layout } from "@/components/layout"
import { useGetItem, useResolveItem, useUpdateItem, useDeleteItem, getGetItemQueryKey, getListItemsQueryKey, getGetItemStatsQueryKey, getGetRecentItemsQueryKey } from "@workspace/api-client-react"
import { useParams, Link, useLocation } from "wouter"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Calendar, Mail, User, CheckCircle2, Edit2, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

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

export default function ItemDetail() {
  const { id } = useParams()
  const itemId = Number(id)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const [isEditing, setIsEditing] = React.useState(false)

  const { data: item, isLoading, isError } = useGetItem(itemId, {
    query: {
      enabled: !!itemId,
      queryKey: getGetItemQueryKey(itemId)
    }
  })

  const resolveItem = useResolveItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  const handleResolve = () => {
    resolveItem.mutate({ id: itemId }, {
      onSuccess: (data) => {
        toast({
          title: "Status updated",
          description: "This notice has been marked as returned to the owner.",
        })
        queryClient.setQueryData(getGetItemQueryKey(itemId), data)
        queryClient.invalidateQueries({ queryKey: ["/api/items/stats"] })
        queryClient.invalidateQueries({ queryKey: ["/api/items"] })
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not update the item. Please try again.",
          variant: "destructive"
        })
      }
    })
  }

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this notice? This action cannot be undone.")) return
    
    deleteItem.mutate({ id: itemId }, {
      onSuccess: () => {
        toast({
          title: "Notice deleted",
          description: "The item has been removed from the school board.",
        })
        queryClient.invalidateQueries({ queryKey: ["/api/items"] })
        queryClient.invalidateQueries({ queryKey: ["/api/items/recent"] })
        queryClient.invalidateQueries({ queryKey: ["/api/items/stats"] })
        setLocation("/")
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not delete the notice.",
          variant: "destructive"
        })
      }
    })
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    updateItem.mutate({
      id: itemId,
      data: {
        category: formData.get("category") as string,
        brand: formData.get("brand") as string,
        color: formData.get("color") as string,
        description: formData.get("description") as string,
        locationDescription: formData.get("locationDescription") as string,
      }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Notice Updated",
          description: "Your changes have been saved.",
        })
        queryClient.setQueryData(getGetItemQueryKey(itemId), data)
        queryClient.invalidateQueries({ queryKey: ["/api/items"] })
        queryClient.invalidateQueries({ queryKey: ["/api/items/recent"] })
        setIsEditing(false)
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not save changes.",
          variant: "destructive"
        })
      }
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-8 w-32 bg-muted rounded"></div>
            <div className="h-[400px] bg-muted rounded-xl"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (isError || !item) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Notice not found</h2>
          <p className="text-muted-foreground mb-8">This notice may have been removed or doesn't exist.</p>
          <Button asChild>
            <Link href="/">Back to School Board</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="mr-2" size={16} />
                Back to School Board
              </Link>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit2 className="mr-2" size={14} />
                {isEditing ? "Cancel Edit" : "Edit"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteItem.isPending}>
                <Trash2 className="mr-2" size={14} />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Col: Image */}
            <div>
              <div className="rounded-2xl overflow-hidden border bg-card shadow-sm sticky top-24">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.description}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted flex items-center justify-center flex-col gap-4 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <span className="font-serif text-3xl opacity-30 rotate-[-10deg]">?</span>
                    </div>
                    <p className="text-sm">No photo provided</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Details */}
            <div className="space-y-8">
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold border-b pb-2 mb-4">Edit Notice</h3>
                  
                  <div className="space-y-3">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      name="category"
                      defaultValue={item.category}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                    >
                      {SCHOOL_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" name="color" defaultValue={item.color} />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" name="brand" defaultValue={item.brand} />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={item.description} className="min-h-[100px]" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="locationDescription">School Location</Label>
                    <Input id="locationDescription" name="locationDescription" defaultValue={item.locationDescription || ""} placeholder="e.g. Room 12, Canteen, Gym" />
                  </div>

                  <Button type="submit" className="w-full" disabled={updateItem.isPending}>
                    {updateItem.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant={item.type === 'lost' ? 'lost' : 'found'} className="text-sm px-3 py-1">
                        {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                      </Badge>
                      {item.status === 'resolved' && (
                        <Badge variant="resolved" className="text-sm px-3 py-1 flex items-center gap-1">
                          <CheckCircle2 size={14} /> Returned
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {item.color} {item.brand} {item.category}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        Posted {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Description</h3>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Details</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <MapPin className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                        <div>
                          <span className="font-medium text-foreground block">School Location</span>
                          <span className="text-muted-foreground">{item.locationDescription || "Not specified"}</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <User className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                        <div>
                          <span className="font-medium text-foreground block">Reported by</span>
                          <span className="text-muted-foreground">{item.reporterName}</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Contact & Action Card */}
                  <Card className="border-primary/20 bg-primary/5">
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">Get in touch</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.type === 'lost' 
                          ? "Found this item at school? Contact the owner to arrange its return."
                          : "Is this yours? Contact the finder to confirm ownership and collect your item."}
                      </p>
                      
                      <div className="flex items-center gap-3 bg-background border rounded-lg p-3 mb-6">
                        <Mail className="text-primary" size={20} />
                        <span className="font-medium">{item.reporterContact}</span>
                      </div>

                      {item.status === 'open' && (
                        <Button 
                          onClick={handleResolve} 
                          disabled={resolveItem.isPending}
                          className="w-full"
                        >
                          {resolveItem.isPending ? "Updating..." : "Mark as Returned to Owner"}
                        </Button>
                      )}
                      {item.status === 'resolved' && (
                        <div className="text-center text-sm font-medium text-muted-foreground bg-muted py-2 rounded-md">
                          This item has been returned to its owner
                        </div>
                      )}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
