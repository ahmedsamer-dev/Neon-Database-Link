import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  ImageIcon,
  Loader2,
  Eye,
  EyeOff,
  Pencil,
  Upload,
  Link as LinkIcon,
  X,
  PackagePlus,
} from "lucide-react";
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

interface NewVariant {
  size: string;
  color: string;
  price: string;
  stock: string;
}

const emptyVariant = (): NewVariant => ({ size: "", color: "", price: "", stock: "0" });
const emptyProduct = () => ({
  name: "",
  description: "",
  basePrice: "",
  images: [] as string[],
  variants: [emptyVariant()],
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminProducts() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingDetails, setEditingDetails] = useState<AdminProduct | null>(null);
  const [detailsForm, setDetailsForm] = useState({ name: "", description: "", basePrice: "" });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState(emptyProduct());
  const [createImageMode, setCreateImageMode] = useState<"url" | "file">("url");
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const [createImageUrl, setCreateImageUrl] = useState("");

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
      toast.success("تم تحديث الصور");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setEditingProduct(null);
    },
    onError: () => toast.error("فشل تحديث الصور"),
  });

  const updateDetailsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/admin/products/${id}?token=${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث المنتج");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setEditingDetails(null);
    },
    onError: () => toast.error("فشل تحديث المنتج"),
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
      toast.success(data.isActive ? "تم تفعيل المنتج" : "تم إخفاء المنتج");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("فشل تحديث المنتج"),
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}?token=${token}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم حذف المنتج");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("فشل حذف المنتج"),
  });

  const addVariantMutation = useMutation({
    mutationFn: async ({ productId, variant }: { productId: string; variant: NewVariant }) => {
      const res = await fetch(`/api/admin/products/${productId}/variants?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size: variant.size,
          color: variant.color,
          price: Number(variant.price),
          stock: Number(variant.stock),
        }),
      });
      if (!res.ok) throw new Error("Failed to add variant");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم إضافة المتغير");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("فشل إضافة المتغير"),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId: string }) => {
      const res = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}?token=${token}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete variant");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم حذف المتغير");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("فشل حذف المتغير"),
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof createForm) => {
      const res = await fetch(`/api/admin/products?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          basePrice: Number(data.basePrice),
          images: data.images,
          variants: data.variants
            .filter((v) => v.size && v.color)
            .map((v) => ({
              size: v.size,
              color: v.color,
              price: Number(v.price) || Number(data.basePrice),
              stock: Number(v.stock),
            })),
        }),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم إنشاء المنتج");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowCreateDialog(false);
      setCreateForm(emptyProduct());
      setCreateImageUrl("");
    },
    onError: () => toast.error("فشل إنشاء المنتج"),
  });

  const openEditImages = (product: AdminProduct) => {
    setEditingProduct(product);
    setEditImages([...product.images]);
    setNewImageUrl("");
    setImageMode("url");
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setEditImages((prev) => [...prev, url]);
    setNewImageUrl("");
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setEditImages((prev) => [...prev, base64]);
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setCreateForm((prev) => ({ ...prev, images: [...prev.images, base64] }));
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    }
    if (createFileInputRef.current) createFileInputRef.current.value = "";
  };

  const [newVariantForms, setNewVariantForms] = useState<Record<string, NewVariant>>({});

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl font-serif font-bold tracking-tight">المنتجات</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">المنتجات</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة المنتجات والصور والمتغيرات</p>
        </div>
        <Button
          onClick={() => {
            setCreateForm(emptyProduct());
            setCreateImageUrl("");
            setShowCreateDialog(true);
          }}
          className="transition-all duration-200 hover:scale-[1.02]"
        >
          <PackagePlus className="h-4 w-4 ml-2" />
          منتج جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {products?.map((product) => {
          const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          const nvForm = newVariantForms[product.id] ?? emptyVariant();

          return (
            <Card key={product.id} className={!product.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden flex items-center justify-center">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-base">{product.name}</h3>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "نشط" : "مخفي"}
                      </Badge>
                      {totalStock === 0 && (
                        <Badge variant="outline" className="text-rose-500 border-rose-200">
                          نفذت الكمية
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span>
                        السعر: <strong className="text-foreground">{product.basePrice.toFixed(2)} ج.م</strong>
                      </span>
                      <span>
                        المخزون الكلي: <strong className="text-foreground">{totalStock}</strong>
                      </span>
                      <span>
                        الصور: <strong className="text-foreground">{product.images.length}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditImages(product)}
                      className="transition-all duration-200 hover:scale-[1.02]"
                    >
                      <ImageIcon className="h-4 w-4 ml-1" />
                      الصور
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingDetails(product);
                        setDetailsForm({
                          name: product.name,
                          description: product.description,
                          basePrice: String(product.basePrice),
                        });
                      }}
                      className="transition-all duration-200 hover:scale-[1.02]"
                    >
                      <Pencil className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => toggleActiveMutation.mutate(product.id)}
                      disabled={toggleActiveMutation.isPending}
                    >
                      {product.isActive ? (
                        <><EyeOff className="h-4 w-4 ml-1" />إخفاء</>
                      ) : (
                        <><Eye className="h-4 w-4 ml-1" />إظهار</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>

                {/* Variants */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">
                    المتغيرات ({product.variants.length})
                  </p>
                  {product.variants.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-3 text-sm p-2 bg-muted/40 rounded"
                        >
                          <span className="font-medium min-w-[40px]">{v.size}</span>
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const s = new Option().style;
                              s.color = v.color;
                              return s.color !== "" ? (
                                <span
                                  className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                                  style={{ backgroundColor: v.color }}
                                />
                              ) : null;
                            })()}
                            <span className="text-muted-foreground">{v.color}</span>
                          </div>
                          <span className="text-muted-foreground">{v.price.toFixed(2)} ج.م</span>
                          <span
                            className={`${v.stock === 0 ? "text-rose-500" : "text-muted-foreground"}`}
                          >
                            مخزون: {v.stock}
                          </span>
                          <button
                            className="mr-auto text-muted-foreground hover:text-destructive transition-colors duration-200"
                            onClick={() =>
                              deleteVariantMutation.mutate({
                                productId: product.id,
                                variantId: v.id,
                              })
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">لا توجد متغيرات</p>
                  )}

                  {/* Add variant form */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                    <Input
                      placeholder="المقاس (S, M, L)"
                      value={nvForm.size}
                      onChange={(e) =>
                        setNewVariantForms((p) => ({
                          ...p,
                          [product.id]: { ...nvForm, size: e.target.value },
                        }))
                      }
                    />
                    <Input
                      placeholder="اللون (red أو #ff0000)"
                      value={nvForm.color}
                      onChange={(e) =>
                        setNewVariantForms((p) => ({
                          ...p,
                          [product.id]: { ...nvForm, color: e.target.value },
                        }))
                      }
                    />
                    <Input
                      placeholder="السعر"
                      type="number"
                      value={nvForm.price}
                      onChange={(e) =>
                        setNewVariantForms((p) => ({
                          ...p,
                          [product.id]: { ...nvForm, price: e.target.value },
                        }))
                      }
                    />
                    <Input
                      placeholder="المخزون"
                      type="number"
                      value={nvForm.stock}
                      onChange={(e) =>
                        setNewVariantForms((p) => ({
                          ...p,
                          [product.id]: { ...nvForm, stock: e.target.value },
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!nvForm.size || !nvForm.color || !nvForm.price || addVariantMutation.isPending}
                      onClick={() => {
                        addVariantMutation.mutate(
                          { productId: product.id, variant: nvForm },
                          {
                            onSuccess: () =>
                              setNewVariantForms((p) => ({
                                ...p,
                                [product.id]: emptyVariant(),
                              })),
                          }
                        );
                      }}
                      className="transition-all duration-200 hover:scale-[1.02]"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة
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
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-serif">تعديل صور — {editingProduct?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">الصور الحالية ({editImages.length})</p>
              {editImages.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                  لا توجد صور
                </p>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editImages.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-md bg-muted/30">
                    <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                      <img
                        src={url}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex-1 truncate font-mono">
                      {url.startsWith("data:") ? "[صورة مرفوعة]" : url}
                    </p>
                    <button
                      onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== index))}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">إضافة صورة</p>
              <div className="flex gap-2 p-1 bg-muted rounded-md">
                <button
                  onClick={() => setImageMode("url")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-all duration-200 ${
                    imageMode === "url" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  رابط URL
                </button>
                <button
                  onClick={() => setImageMode("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-all duration-200 ${
                    imageMode === "file" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  رفع من الجهاز
                </button>
              </div>

              {imageMode === "url" ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
                  />
                  <Button variant="outline" onClick={addImageUrl} disabled={!newImageUrl.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileUpload}
                  />
                  <Button
                    variant="outline"
                    className="w-full transition-all duration-200 hover:scale-[1.01]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    اختر صورة من جهازك
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    JPG, PNG, WEBP — حتى 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              إلغاء
            </Button>
            <Button
              onClick={() =>
                updateImagesMutation.mutate({ id: editingProduct!.id, images: editImages })
              }
              disabled={updateImagesMutation.isPending}
              className="transition-all duration-200 hover:scale-[1.01]"
            >
              {updateImagesMutation.isPending && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              حفظ الصور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog open={!!editingDetails} onOpenChange={(open) => !open && setEditingDetails(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-serif">تعديل تفاصيل المنتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">اسم المنتج</label>
              <Input
                value={detailsForm.name}
                onChange={(e) => setDetailsForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="اسم المنتج"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الوصف</label>
              <textarea
                value={detailsForm.description}
                onChange={(e) => setDetailsForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="وصف المنتج"
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">السعر الأساسي (ج.م)</label>
              <Input
                type="number"
                value={detailsForm.basePrice}
                onChange={(e) => setDetailsForm((p) => ({ ...p, basePrice: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setEditingDetails(null)}>
              إلغاء
            </Button>
            <Button
              onClick={() =>
                updateDetailsMutation.mutate({
                  id: editingDetails!.id,
                  data: {
                    name: detailsForm.name,
                    description: detailsForm.description,
                    basePrice: Number(detailsForm.basePrice),
                  },
                })
              }
              disabled={updateDetailsMutation.isPending || !detailsForm.name || !detailsForm.basePrice}
              className="transition-all duration-200 hover:scale-[1.01]"
            >
              {updateDetailsMutation.isPending && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => !open && setShowCreateDialog(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-serif">إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">اسم المنتج *</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="اسم المنتج"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">السعر الأساسي (ج.م) *</label>
                <Input
                  type="number"
                  value={createForm.basePrice}
                  onChange={(e) => setCreateForm((p) => ({ ...p, basePrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الوصف</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="وصف المنتج"
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Images */}
            <div className="space-y-3">
              <label className="text-sm font-medium">الصور</label>
              {createForm.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {createForm.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded overflow-hidden border">
                      <img src={img} className="w-full h-full object-cover" />
                      <button
                        onClick={() =>
                          setCreateForm((p) => ({
                            ...p,
                            images: p.images.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 p-1 bg-muted rounded-md">
                <button
                  onClick={() => setCreateImageMode("url")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-all duration-200 ${
                    createImageMode === "url" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  رابط URL
                </button>
                <button
                  onClick={() => setCreateImageMode("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-all duration-200 ${
                    createImageMode === "file" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  رفع من الجهاز
                </button>
              </div>
              {createImageMode === "url" ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={createImageUrl}
                    onChange={(e) => setCreateImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && createImageUrl.trim()) {
                        setCreateForm((p) => ({ ...p, images: [...p.images, createImageUrl.trim()] }));
                        setCreateImageUrl("");
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (createImageUrl.trim()) {
                        setCreateForm((p) => ({
                          ...p,
                          images: [...p.images, createImageUrl.trim()],
                        }));
                        setCreateImageUrl("");
                      }
                    }}
                    disabled={!createImageUrl.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    ref={createFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCreateFileUpload}
                  />
                  <Button
                    variant="outline"
                    className="w-full transition-all duration-200 hover:scale-[1.01]"
                    onClick={() => createFileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    اختر صورة من جهازك
                  </Button>
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">المتغيرات (المقاسات والألوان)</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setCreateForm((p) => ({ ...p, variants: [...p.variants, emptyVariant()] }))
                  }
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة
                </Button>
              </div>
              {createForm.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <Input
                    placeholder="المقاس"
                    value={v.size}
                    onChange={(e) =>
                      setCreateForm((p) => {
                        const variants = [...p.variants];
                        variants[i] = { ...variants[i], size: e.target.value };
                        return { ...p, variants };
                      })
                    }
                  />
                  <Input
                    placeholder="اللون"
                    value={v.color}
                    onChange={(e) =>
                      setCreateForm((p) => {
                        const variants = [...p.variants];
                        variants[i] = { ...variants[i], color: e.target.value };
                        return { ...p, variants };
                      })
                    }
                  />
                  <Input
                    placeholder="السعر"
                    type="number"
                    value={v.price}
                    onChange={(e) =>
                      setCreateForm((p) => {
                        const variants = [...p.variants];
                        variants[i] = { ...variants[i], price: e.target.value };
                        return { ...p, variants };
                      })
                    }
                  />
                  <Input
                    placeholder="المخزون"
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      setCreateForm((p) => {
                        const variants = [...p.variants];
                        variants[i] = { ...variants[i], stock: e.target.value };
                        return { ...p, variants };
                      })
                    }
                  />
                  <button
                    onClick={() =>
                      setCreateForm((p) => ({
                        ...p,
                        variants: p.variants.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-muted-foreground hover:text-destructive transition-colors duration-200 flex justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => createProductMutation.mutate(createForm)}
              disabled={
                createProductMutation.isPending || !createForm.name || !createForm.basePrice
              }
              className="transition-all duration-200 hover:scale-[1.01]"
            >
              {createProductMutation.isPending && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              إنشاء المنتج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
