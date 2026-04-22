import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  // Passing empty token since this is public
  const { data: order, isLoading } = useGetOrder(id || "", { token: "" }, { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl text-center space-y-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl text-center">
        <h1 className="text-2xl font-serif mb-4">Order not found</h1>
        <Button asChild>
          <Link href="/">Return to Shop</Link>
        </Button>
      </div>
    );
  }

  const generateWhatsAppLink = () => {
    const phone = "+15550100199";
    const itemsList = order.items.map(item => 
      `- ${item.quantity}x ${item.productName} (${item.color}, ${item.size})`
    ).join("%0A");
    
    const message = `Hello PEACE.%0A%0AI've placed an order.%0AOrder ID: ${order.id}%0AName: ${order.customerName}%0A%0AItems:%0A${itemsList}%0A%0ATotal: $${order.totalAmount.toFixed(2)}%0A%0AI will send payment from ${order.paymentPhone}. Please confirm!`;
    
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`;
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <CheckCircle2 className="h-10 w-10" />
      </motion.div>

      <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
        Thank you for your order.
      </h1>
      
      <p className="text-muted-foreground text-lg mb-8">
        Your order <span className="font-mono text-foreground">{order.id}</span> has been placed.
      </p>

      <div className="bg-muted/50 p-6 md:p-8 rounded-lg text-left mb-8 border border-border">
        <h3 className="font-serif font-medium text-xl mb-4">Next Steps: Payment</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          To complete your order, please send <strong className="text-foreground">${order.totalAmount.toFixed(2)}</strong> via mobile transfer to our business number: <strong className="text-foreground font-mono bg-background px-2 py-1 rounded">+1 555 010 0199</strong>.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Once sent, click the button below to message us on WhatsApp with your order details so we can confirm your payment.
        </p>
        
        <Button asChild size="lg" className="w-full h-14 bg-[#25D366] hover:bg-[#1da851] text-white">
          <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            Send order on WhatsApp
          </a>
        </Button>
      </div>

      <Button variant="outline" asChild>
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  );
}
