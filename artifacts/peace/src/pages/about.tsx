import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="flex flex-col w-full" dir="rtl">

      {/* HERO */}
      <section className="relative h-[85vh] min-h-[560px] w-full flex flex-col items-center justify-end overflow-hidden bg-neutral-900">
        <img
          src="/about-hero.jpg"
          alt="PEACE clothing brand"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.55 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-900/30 to-transparent" />

        <div className="relative z-10 w-full px-6 md:px-16 pb-16 max-w-5xl mx-auto">
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
            className="mt-5 text-white/75 text-xl md:text-2xl font-light max-w-lg leading-relaxed"
          >
            مش بس لبس.. ده إحساس 🕊️
          </motion.p>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-24 container mx-auto px-6 md:px-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 block">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">من نحن</h2>
            <p className="text-foreground/90 leading-relaxed text-base mb-4 font-medium">
              Peace بدأت بفكرة بسيطة:<br />
              إزاي تعمل لبس يحسسك بالهدوء في وسط دنيا صاخبة؟
            </p>
            <p className="text-muted-foreground leading-relaxed text-base mb-8">
              كل قطعة عندنا مصنوعة بعناية — من قطن طبيعي ناعم، بتصميم هادئ يتكلم عنك
              من غير ضجة. مش موضة سريعة، ده لبس يصحبك سنين.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" className="rounded-sm px-10">
                <Link href="/">تسوق الآن ←</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="aspect-[4/5] bg-muted rounded-sm overflow-hidden"
          >
            <img
              src="/about.jpg"
              alt="Peace brand"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

        </div>
      </section>

      {/* لماذا نحن الأفضل */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-6 md:px-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-background/40 mb-3 block">Why Us</span>
            <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">لماذا نحن الأفضل</h2>
            <p className="text-background/60 max-w-xl mx-auto">
              ليس مجرد كلام — بل التزام راسخ بكل خطوة من رحلتك معنا
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "✨", title: "جودة لا تُساوم", desc: "نختار أقمشتنا بعناية شديدة لضمان الراحة والمتانة معاً. قطعك من Peace تصحبك لسنوات." },
              { icon: "🎨", title: "تصاميم خالدة", desc: "بعيداً عن صخب الموضة السريعة، نصنع قطعاً تتجاوز الموسم. ترتديها اليوم وتحبها بعد خمس سنوات." },
              { icon: "💎", title: "سعر عادل حقيقي", desc: "نؤمن أن الجودة الحقيقية يجب أن تكون في متناول الجميع. أسعارنا صادقة تعكس القيمة الفعلية." },
              { icon: "🤝", title: "خدمة تشعرك باهتمام", desc: "من لحظة طلبك حتى وصوله إليك، فريقنا موجود لك. راحتك أولويتنا الأولى والأخيرة." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="flex gap-5 p-6 border border-background/10 rounded-sm hover:bg-background/5 transition-colors duration-200 cursor-default"
              >
                <div className="flex-shrink-0 text-3xl leading-none mt-1">{item.icon}</div>
                <div>
                  <h3 className="font-semibold mb-2 text-background">{item.title}</h3>
                  <p className="text-background/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
