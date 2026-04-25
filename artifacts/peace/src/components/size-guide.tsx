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

const SIZE_DATA: Array<{ size: string; weight: string; height: string }> = [
  { size: "S",   weight: "55 – 65",  height: "155 – 165" },
  { size: "M",   weight: "65 – 75",  height: "165 – 173" },
  { size: "L",   weight: "75 – 90",  height: "170 – 178" },
  { size: "XL",  weight: "90 – 105", height: "175 – 183" },
  { size: "XXL", weight: "105 – 120",height: "180 – 190" },
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
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">دليل المقاسات</DialogTitle>
          <DialogDescription>
            اختار مقاسك حسب وزنك وطولك بالكيلو والسنتيمتر.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto -mx-2 px-2 mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-3 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  المقاس
                </th>
                <th className="text-right py-3 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  الوزن (كجم)
                </th>
                <th className="text-right py-3 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  الطول (سم)
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZE_DATA.map((row) => (
                <tr key={row.size} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 font-semibold">{row.size}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.weight}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          نصيحة: لو كنت بين مقاسين، اختار المقاس الأكبر للإحساس الـ oversized المريح.
        </p>
      </DialogContent>
    </Dialog>
  );
}
