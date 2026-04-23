import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ImageIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  images: string[];
  variants: ProductVariant[];
}

export default function AdminProducts() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);

  const { data: products, isLoading } = useQuery<AdminProduct[]>({
    queryKey: ["admin-products", token],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products?token=${token}`);
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
    enabled: !!token,
  });

  const updateImagesMutation = useMutation({
    mutationFn: async ({ id, images }: { id: string; images: string[] }) => {
      const res = await fetch(`/api/admin/products/${id}/images?token=${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) throw new Error("Failed to update images");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Images updated");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setEditingProduct(null);
    },
    onError: () => toast.error("Failed to update images"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}/toggle?token=${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: (data: AdminProduct) => {
      toast.success(`Product ${data.isActive ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("Failed to update product"),
  });

  const openEditImages = (product: AdminProduct) => {
    setEditingProduct(product);
    setEditImages([...product.images]);
    setNewImageUrl("");
  };

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setEditImages((prev) => [...prev, url]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const saveImages = () => {
    if (!editingProduct) return;
    updateImagesMutation.mutate({ id: editingProduct.id, images: editImages });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold tracking-tight">Products</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage product images and visibility</p>
      </div>

      <div className="grid gap-4">
        {products?.map((product) => {
          const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          return (
            <Card key={product.id} className={!product.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden flex items-center justify-center">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-base">{product.name}</h3>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Price: <strong className="text-foreground">${product.basePrice.toFixed(2)}</strong></span>
                      <span>Total stock: <strong className="text-foreground">{totalStock}</strong></span>
                      <span>Images: <strong className="text-foreground">{product.images.length}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEditImages(product)}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Edit Images
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => toggleActiveMutation.mutate(product.id)}
                      disabled={toggleActiveMutation.isPending}
                    >
                      {product.isActive ? (
                        <><EyeOff className="h-4 w-4 mr-2" />Hide</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-2" />Show</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Images Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Images — {editingProduct?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Current images */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Images ({editImages.length})</p>
              {editImages.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">No images yet</p>
              )}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {editImages.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-md bg-muted/30">
                    <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex-1 truncate font-mono">{url}</p>
                    <button
                      onClick={() => removeImage(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add new image */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Add Image URL</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addImage()}
                />
                <Button variant="outline" onClick={addImage} disabled={!newImageUrl.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Enter a full image URL and press Enter or click +</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
            <Button onClick={saveImages} disabled={updateImagesMutation.isPending}>
              {updateImagesMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
