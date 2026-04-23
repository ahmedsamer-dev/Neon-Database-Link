import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { CartProvider } from "@/lib/cart";
import { AuthProvider, useAuth } from "@/lib/auth";

import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/admin-layout";

import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/order-detail";
import AdminNotifications from "@/pages/admin/notifications";
import AdminProducts from "@/pages/admin/products";
import AdminSettings from "@/pages/admin/settings";

const queryClient = new QueryClient();

// Protected Route Guard for Admin
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token } = useAuth();
  
  if (!token) {
    return <Redirect to="/admin/login" />;
  }

  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin') && location !== '/admin/login';

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/products/:id" component={() => <Layout><ProductDetail /></Layout>} />
      <Route path="/checkout" component={() => <Layout><Checkout /></Layout>} />
      <Route path="/order-confirmation/:id" component={() => <Layout><OrderConfirmation /></Layout>} />

      {/* Admin Auth Route */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Protected Admin Routes */}
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path="/admin/orders" component={() => <ProtectedRoute component={AdminOrders} />} />
      <Route path="/admin/orders/:id" component={() => <ProtectedRoute component={AdminOrderDetail} />} />
      <Route path="/admin/notifications" component={() => <ProtectedRoute component={AdminNotifications} />} />
      <Route path="/admin/products" component={() => <ProtectedRoute component={AdminProducts} />} />
      <Route path="/admin/settings" component={() => <ProtectedRoute component={AdminSettings} />} />

      <Route component={() => (isAdminRoute ? <AdminLayout><NotFound /></AdminLayout> : <Layout><NotFound /></Layout>)} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
