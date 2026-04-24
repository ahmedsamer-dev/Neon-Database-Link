import { useState } from "react";
import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SIZE_DATA: Array<{ size: string; chest: string; waist: string; length: string }> = [
  { size: "S", chest: "92 - 96", waist: "76 - 80", length: "68" },
  { size: "M", chest: "96 - 100", waist: "80 - 84", length: "70" },
  { size: "L", chest: "100 - 106", waist: "84 - 90", length: "72" },
  { size: "XL", chest: "106 - 112", waist: "90 - 96", length: "74" },
  { size: "XXL", chest: "112 - 118", waist: "96 - 102", length: "76" },
];

export function SizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <Ruler className="h-3.5 w-3.5" />
          دليل المقاسات
        </button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">دليل المقاسات</DialogTitle>
          <DialogDescription>
            جميع القياسات بالسنتيمتر. للحصول على أفضل مقاس، قس صدرك ووسطك مع
            إبقاء شريط القياس مرناً وغير مشدود.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto -mx-2 px-2 mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  المقاس
                </th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  الصدر
                </th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  الخصر
                </th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  الطول
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZE_DATA.map((row) => (
                <tr key={row.size} className="border-b border-border last:border-0">
                  <td className="py-3 px-2 font-medium">{row.size}</td>
                  <td className="py-3 px-2 text-muted-foreground">{row.chest}</td>
                  <td className="py-3 px-2 text-muted-foreground">{row.waist}</td>
                  <td className="py-3 px-2 text-muted-foreground">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          نصيحة: لو كنت بين مقاسين، اختر المقاس الأكبر للحصول على إحساس
          oversized مريح يتناسب مع روح المجموعة.
        </p>
      </DialogContent>
    </Dialog>
  );
}
