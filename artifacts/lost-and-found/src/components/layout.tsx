import { Link } from "wouter"
import { Search, PlusCircle, School, HandHeart } from "lucide-react"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg rotate-3">
              <School size={24} />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-primary">LaSalleFindIt</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <Search size={16} />
              <span className="hidden sm:inline">Browse</span>
            </Link>
            <Link href="/report" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Report</span>
            </Link>
            
            <Link href="/report" className="ml-2 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              New Notice
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-8 mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex justify-center items-center gap-2 mb-4">
            <School size={20} className="text-primary/50" />
          </div>
          <p>© {new Date().getFullYear()} SchoolFindIt. The official lost and found board for our school.</p>
          <p className="mt-1">Helping students and staff reunite with their belongings.</p>
        </div>
      </footer>
    </div>
  );
}
