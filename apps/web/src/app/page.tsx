import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">PilotNow Web</h1>
      <p className="text-muted-foreground">Next.js 16 + shadcn/ui setup complete.</p>
      <Button>Get Started</Button>
    </main>
  );
}
