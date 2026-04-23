import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function About() {
  return (
    <div className="flex flex-col w-full" dir="rtl">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.jpg"
            alt="Peace brand"
            className="w-full h-full object-cover opacity-40 mix-blend-multiply"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-foreground mb-4"
          >
            PEACE.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-foreground/70 font-medium"
          >
            أزياء تعكس هدوءك الداخلي
          </motion.p>
        </div>
      </section>

      {/* من نحن */}
      <section className="py-24 container mx-auto px-4 md:px-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-serif font-bold mb-6 tracking-tight">من نحن</h2>
            <p className="text-muted-foreground leading-relaxed text-base mb-4">
              Peace. ليست مجرد علامة تجارية للملابس — إنها فلسفة حياة. أُسِّست بإيمان راسخ بأن ما
              ترتديه يعكس من أنت من الداخل. نؤمن بأن الهدوء والتوازن يمكن أن يُعبَّر عنهما من خلال
              كل قطعة تلبسها.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              بدأنا برؤية بسيطة: تصميم ملابس تجمع بين الراحة والأناقة، قطع يمكنك ارتداؤها يومياً
              دون أن تفقد طابعك الشخصي. كل خيط، كل قصة، كل تفصيلة — مصممة بعناية لك.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="aspect-square bg-muted rounded-sm overflow-hidden"
          >
            <img
              src="/hero.jpg"
              alt="Peace brand story"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ماذا نقدم */}
      <section className="bg-secondary/50 py-24">
        <div className="container mx-auto px-4 md:px-16 max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">ماذا نقدم</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              نقدم تشكيلة متكاملة من الملابس العصرية التي تناسب أسلوب حياتك الهادئ والواثق
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "تيشيرتات أوفر سايز",
                desc: "مصممة من أجود أنواع الأقطان الطبيعية. ناعمة على الجلد، مريحة للروح.",
                icon: "👕",
              },
              {
                title: "هوديز & سويتشيرتات",
                desc: "دفء لا يُقاوم مع تصاميم محكمة تناسب كل مناسبة من الصباح للمساء.",
                icon: "🧥",
              },
              {
                title: "إكسسوارات مختارة",
                desc: "تفاصيل صغيرة تصنع الفارق. اكتمل إطلالتك بلمسة Peace الهادئة.",
                icon: "🎒",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background p-8 rounded-sm text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* لماذا نحن الأفضل */}
      <section className="py-24 container mx-auto px-4 md:px-16 max-w-4xl">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">لماذا نحن الأفضل</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ليس مجرد كلام — بل التزام راسخ بكل خطوة من رحلتك معنا
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "جودة لا تُساوم",
              desc: "نختار أقمشتنا بعناية شديدة لضمان الراحة والمتانة معاً. قطعك من Peace تصحبك لسنوات.",
            },
            {
              title: "تصاميم خالدة",
              desc: "بعيداً عن صخب الموضة السريعة، نصنع قطعاً تتجاوز الموسم. ترتديها اليوم وتحبها بعد خمس سنوات.",
            },
            {
              title: "سعر عادل حقيقي",
              desc: "نؤمن أن الجودة الحقيقية يجب أن تكون في متناول الجميع. أسعارنا صادقة تعكس القيمة الفعلية.",
            },
            {
              title: "خدمة تشعرك باهتمام",
              desc: "من لحظة طلبك حتى وصوله إليك، فريقنا موجود لك. راحتك أولويتنا الأولى والأخيرة.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-4 p-6 border rounded-sm hover:bg-muted/30 transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-foreground" />
              <div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-serif font-bold mb-4">ابدأ رحلتك مع Peace.</h2>
            <p className="text-background/70 mb-8 leading-relaxed">
              استكشف مجموعتنا المختارة بعناية واختر ما يعكس هويتك الحقيقية
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-background text-background hover:bg-background hover:text-foreground transition-all duration-300 hover:scale-[1.02] px-10"
            >
              <Link href="/">تسوق الآن</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
