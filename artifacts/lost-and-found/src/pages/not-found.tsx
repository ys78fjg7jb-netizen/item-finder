import { Link } from "wouter"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-sm">
        <span className="font-serif text-5xl text-muted-foreground opacity-50 rotate-[-10deg]">?</span>
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Looks like you're lost</h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        We couldn't find the page you're looking for. It might have been moved or the link is incorrect.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return to Notice Board</Link>
      </Button>
    </div>
  )
}
