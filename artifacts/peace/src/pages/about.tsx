import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const pillars = [
  { ar: "قُطن طبيعي", en: "Natural Cotton" },
  { ar: "تصميم هادئ", en: "Calm Design" },
  { ar: "جودة تدوم", en: "Lasting Quality" },
  { ar: "سعر صادق", en: "Fair Price" },
];

const products = [
  {
    title: "تيشيرتات أوفر سايز",
    desc: "مصممة من أجود أنواع الأقطان الطبيعية. ناعمة على الجلد، مريحة للروح.",
    icon: "👕",
    label: "Oversized Tees",
  },
  {
    title: "هوديز & سويتشيرتات",
    desc: "دفء لا يُقاوم مع تصاميم محكمة تناسب كل مناسبة من الصباح للمساء.",
    icon: "🧥",
    label: "Hoodies",
  },
  {
    title: "إكسسوارات مختارة",
    desc: "تفاصيل صغيرة تصنع الفارق. اكتمل إطلالتك بلمسة Peace الهادئة.",
    icon: "🎒",
    label: "Accessories",
  },
];

const reasons = [
  {
    title: "جودة لا تُساوم",
    desc: "نختار أقمشتنا بعناية شديدة لضمان الراحة والمتانة معاً. قطعك من Peace تصحبك لسنوات.",
    icon: "✨",
  },
  {
    title: "تصاميم خالدة",
    desc: "بعيداً عن صخب الموضة السريعة، نصنع قطعاً تتجاوز الموسم. ترتديها اليوم وتحبها بعد خمس سنوات.",
    icon: "🎨",
  },
  {
    title: "سعر عادل حقيقي",
    desc: "نؤمن أن الجودة الحقيقية يجب أن تكون في متناول الجميع. أسعارنا صادقة تعكس القيمة الفعلية.",
    icon: "💎",
  },
  {
    title: "خدمة تشعرك باهتمام",
    desc: "من لحظة طلبك حتى وصوله إليك، فريقنا موجود لك. راحتك أولويتنا الأولى والأخيرة.",
    icon: "🤝",
  },
];

export default function About() {
  return (
    <div className="flex flex-col w-full" dir="rtl">

      {/* ═══ HERO ═══ */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex flex-col items-center justify-end overflow-hidden bg-neutral-900">
        <img
          src="/about-hero.jpg"
          alt="PEACE clothing brand"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.55 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-900/30 to-transparent" />

        <div className="relative z-10 w-full px-6 md:px-16 pb-16 max-w-6xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="block text-xs uppercase tracking-[0.35em] text-white/50 mb-5 font-medium"
          >
            Clothing Brand · Egypt · Est. 2024
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-bold text-white leading-none tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
          >
            PEACE.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-4 text-white/70 text-lg md:text-2xl font-light max-w-xl leading-snug"
          >
            ملابس بُنيت على صمت الداخل.<br />
            <span className="text-white/40 text-base">Wear the calm.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
          >
            {pillars.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                <span className="text-white/60 text-sm">{p.ar}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SCROLLING MANIFESTO STRIP ═══ */}
      <section className="bg-foreground text-background py-10 overflow-hidden">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 text-sm uppercase tracking-[0.25em] font-medium text-background/40 select-none"
          style={{ width: "max-content" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>PEACE 🕊️</span>
              <span className="text-background/20">·</span>
              <span>Wear the calm</span>
              <span className="text-background/20">·</span>
              <span>ارتدِ هدوءك ✨</span>
              <span className="text-background/20">·</span>
              <span>Cotton Quality 👕</span>
              <span className="text-background/20">·</span>
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══ من نحن ═══ */}
      <section className="py-24 container mx-auto px-4 md:px-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp} className="order-2 md:order-1">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 block">Our Story</span>
            <h2 className="text-4xl font-serif font-bold mb-6 tracking-tight leading-tight">من نحن</h2>
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
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="order-1 md:order-2 aspect-[4/5] bg-muted rounded-sm overflow-hidden"
          >
            <img
              src="/about.jpg"
              alt="Peace brand story"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ ماذا نقدم — with emojis ═══ */}
      <section className="bg-secondary/50 py-24">
        <div className="container mx-auto px-4 md:px-16 max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block">What We Offer</span>
            <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">ماذا نقدم</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              نقدم تشكيلة متكاملة من الملابس العصرية التي تناسب أسلوب حياتك الهادئ والواثق
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {products.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="bg-background p-8 rounded-sm text-center cursor-default"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 + 0.2, type: "spring", stiffness: 200 }}
                  className="text-5xl mb-5"
                >
                  {item.icon}
                </motion.div>
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ لماذا نحن الأفضل — with emojis ═══ */}
      <section className="py-24 container mx-auto px-4 md:px-16 max-w-4xl">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Why Us</span>
          <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">لماذا نحن الأفضل</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ليس مجرد كلام — بل التزام راسخ بكل خطوة من رحلتك معنا
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="flex gap-5 p-6 border rounded-sm hover:bg-muted/30 transition-colors duration-200 cursor-default"
            >
              <div className="flex-shrink-0 text-3xl leading-none mt-1">{item.icon}</div>
              <div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden bg-foreground text-background py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="text-5xl mb-6"
            >
              🕊️
            </motion.div>
            <span className="text-xs uppercase tracking-[0.3em] text-background/40 mb-4 block">Ready?</span>
            <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">ابدأ رحلتك مع Peace.</h2>
            <p className="text-background/60 mb-10 leading-relaxed text-lg">
              استكشف مجموعتنا المختارة بعناية<br />واختر ما يعكس هويتك الحقيقية
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-background/40 text-background hover:bg-background hover:text-foreground transition-all duration-300 px-12 rounded-sm"
              >
                <Link href="/">تسوق الآن ←</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
