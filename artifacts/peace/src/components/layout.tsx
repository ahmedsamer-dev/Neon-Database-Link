import { Navbar } from "./navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="font-serif font-bold text-xl mb-2">PEACE.</h3>
            <p className="text-sm text-muted-foreground">Wear the calm. Live with intention.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
