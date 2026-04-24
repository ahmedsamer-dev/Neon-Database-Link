import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/admin-layout";

import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import NotFound from "@/pages/not-found";

const Checkout = lazy(() => import("@/pages/checkout"));
const OrderConfirmation = lazy(() => import("@/pages/order-confirmation"));
const About = lazy(() => import("@/pages/about"));
const TrackOrder = lazy(() => import("@/pages/track-order"));
const WishlistPage = lazy(() => import("@/pages/wishlist"));

const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminOrderDetail = lazy(() => import("@/pages/admin/order-detail"));
const AdminNotifications = lazy(() => import("@/pages/admin/notifications"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token } = useAuth();
  if (!token) return <Redirect to="/admin/login" />;
  return (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </AdminLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin") && location !== "/admin/login";

  return (
    <Switch>
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route
        path="/products/:id"
        component={() => <Layout><ProductDetail /></Layout>}
      />
      <Route
        path="/checkout"
        component={() => (
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Checkout />
            </Suspense>
          </Layout>
        )}
      />
      <Route
        path="/order-confirmation/:id"
        component={() => (
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <OrderConfirmation />
            </Suspense>
          </Layout>
        )}
      />
      <Route
        path="/about"
        component={() => (
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          </Layout>
        )}
      />
      <Route
        path="/track"
        component={() => (
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <TrackOrder />
            </Suspense>
          </Layout>
        )}
      />
      <Route
        path="/wishlist"
        component={() => (
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <WishlistPage />
            </Suspense>
          </Layout>
        )}
      />

      <Route
        path="/admin/login"
        component={() => (
          <Suspense fallback={<PageLoader />}>
            <AdminLogin />
          </Suspense>
        )}
      />

      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path="/admin/orders" component={() => <ProtectedRoute component={AdminOrders} />} />
      <Route
        path="/admin/orders/:id"
        component={() => <ProtectedRoute component={AdminOrderDetail} />}
      />
      <Route
        path="/admin/notifications"
        component={() => <ProtectedRoute component={AdminNotifications} />}
      />
      <Route
        path="/admin/products"
        component={() => <ProtectedRoute component={AdminProducts} />}
      />
      <Route
        path="/admin/settings"
        component={() => <ProtectedRoute component={AdminSettings} />}
      />

      <Route
        component={() =>
          isAdminRoute ? (
            <AdminLayout><NotFound /></AdminLayout>
          ) : (
            <Layout><NotFound /></Layout>
          )
        }
      />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
