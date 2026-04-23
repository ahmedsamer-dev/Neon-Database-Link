import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingCart, Bell, LogOut, Package, Settings } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-muted/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background border-r border-border md:h-screen flex flex-col md:sticky top-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="font-serif font-bold text-xl tracking-tight">
            PEACE. <span className="text-sm font-sans font-normal text-muted-foreground">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                  ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          
          <div className="md:mt-auto pt-4 md:border-t mt-0 border-l md:border-l-0 border-border ml-4 md:ml-0 pl-4 md:pl-0">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
