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

      {/* THREE VALUES */}
      <section className="border-t py-16 bg-secondary/30">
        <div className="container mx-auto px-6 md:px-16 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { icon: "🌿", title: "خامات فاخرة", desc: "قطن طبيعي ١٠٠٪ ناعم ومتين" },
              { icon: "🕊️", title: "راحة حقيقية", desc: "مريحة من الصبح لآخر الليل" },
              { icon: "🖤", title: "تصميم minimal", desc: "هادئ وأنيق بدون زيادة" },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-muted-foreground text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
