import { Link } from "wouter";
import { Navbar } from "./navbar";
import { WhatsAppFab } from "./whatsapp-fab";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans" dir="rtl">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="py-14 border-t mt-auto bg-background">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <h3 className="font-serif font-bold text-xl mb-2">PEACE.</h3>
            <p className="text-sm text-muted-foreground">
              Wear the calm. Live with intention.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              المتجر
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="link-premium inline-block">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/about" className="link-premium inline-block">
                  من نحن
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              المساعدة
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/track" className="link-premium inline-block">
                  تتبع طلبك
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} PEACE. جميع الحقوق محفوظة.
        </div>
      </footer>
      <WhatsAppFab />
    </div>
  );
}
