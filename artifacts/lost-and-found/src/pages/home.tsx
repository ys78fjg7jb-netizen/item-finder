import * as React from "react"
import { Layout } from "@/components/layout"
import { useGetItemStats, useListItems, getListItemsQueryKey, useGetRecentItems, getGetRecentItemsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, Search, FilterX, Clock } from "lucide-react"
import { format } from "date-fns"
import { Link } from "wouter"

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

export default function Home() {
  const [filters, setFilters] = React.useState({
    type: "",
    category: "",
    status: "open",
    query: ""
  })

  const apiParams = {
    ...(filters.type && { type: filters.type as any }),
    ...(filters.category && { category: filters.category }),
    ...(filters.status && { status: filters.status as any }),
  }

  const { data: items, isLoading: itemsLoading } = useListItems(apiParams, {
    query: {
      queryKey: getListItemsQueryKey(apiParams),
    }
  })

  const { data: stats } = useGetItemStats({
    query: {
      queryKey: ["/api/items/stats"]
    }
  })

  const { data: recentItems } = useGetRecentItems({
    query: {
      queryKey: getGetRecentItemsQueryKey()
    }
  })

  const displayedItems = React.useMemo(() => {
    if (!items) return []
    if (!filters.query) return items
    const lowerQ = filters.query.toLowerCase()
    return items.filter(it => 
      it.description.toLowerCase().includes(lowerQ) || 
      it.brand.toLowerCase().includes(lowerQ) ||
      it.category.toLowerCase().includes(lowerQ) ||
      it.color.toLowerCase().includes(lowerQ)
    )
  }, [items, filters.query])

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-10">
          <div className="w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Lost something at school?
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              The official lost and found board for our school. Report a missing item or let classmates know what you've found — right here.
            </p>

            <div className="bg-card shadow-lg rounded-2xl p-4 sm:p-6 flex flex-wrap justify-center gap-4 sm:gap-8 border">
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{stats?.totalLost || 0}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Lost Items</div>
              </div>
              <div className="w-px bg-border hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{stats?.totalFound || 0}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Found Items</div>
              </div>
              <div className="w-px bg-border hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-foreground">{stats?.totalResolved || 0}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Returned</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="bg-card border rounded-xl p-5 sticky top-24">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Search size={18} />
                Filters
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Search</label>
                  <Input 
                    placeholder="Keywords..." 
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Notice Type</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="">All Notices</option>
                    <option value="lost">Lost Items</option>
                    <option value="found">Found Items</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">All Categories</option>
                    {SCHOOL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">Any Status</option>
                    <option value="open">Open / Not Yet Returned</option>
                    <option value="resolved">Returned to Owner</option>
                  </select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({ type: "", category: "", status: "open", query: "" })}
                >
                  <FilterX className="mr-2" size={16} />
                  Reset Filters
                </Button>
              </div>
            </div>
            
            {/* Recent Notices Sidebar snippet */}
            {recentItems && recentItems.length > 0 && (
              <div className="bg-card border rounded-xl p-5">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Clock size={18} />
                  Just Posted
                </h2>
                <div className="space-y-4">
                  {recentItems.slice(0, 4).map(item => (
                    <Link key={item.id} href={`/items/${item.id}`} className="group block group">
                      <div className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                        {item.color} {item.brand} {item.category}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Badge variant={item.type === 'lost' ? 'lost' : 'found'} className="px-1.5 py-0 text-[10px]">
                          {item.type.toUpperCase()}
                        </Badge>
                        <span className="truncate">{item.locationDescription}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1">
            {itemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[300px] rounded-xl bg-card border animate-pulse"></div>
                ))}
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="text-center py-24 bg-card border border-dashed rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="text-muted-foreground" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No notices found</h3>
                <p className="text-muted-foreground mt-1 mb-6">Try adjusting your filters or be the first to post a notice.</p>
                <Link href="/report" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                  Post a Notice
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedItems.map(item => (
                  <Link key={item.id} href={`/items/${item.id}`} className="group block">
                    <Card className="h-full transition-all hover:shadow-md hover:border-primary/40 group-hover:-translate-y-1">
                      {item.imageUrl ? (
                        <div className="aspect-[4/3] w-full relative overflow-hidden rounded-t-xl border-b">
                          <img 
                            src={item.imageUrl} 
                            alt={item.description} 
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge variant={item.type === 'lost' ? 'lost' : 'found'} className="shadow-sm">
                              {item.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] w-full relative bg-muted flex items-center justify-center rounded-t-xl border-b">
                          <div className="text-muted-foreground/50 font-serif text-3xl opacity-30 rotate-[-10deg]">No Photo</div>
                          <div className="absolute top-3 left-3">
                            <Badge variant={item.type === 'lost' ? 'lost' : 'found'} className="shadow-sm">
                              {item.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {item.color} {item.brand} {item.category}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {item.description}
                        </p>

                        <div className="space-y-2 mt-auto">
                          {item.locationDescription && (
                            <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                              <MapPin size={14} className="shrink-0" />
                              <span className="line-clamp-1">{item.locationDescription}</span>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                            <Calendar size={14} className="shrink-0" />
                            <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}
