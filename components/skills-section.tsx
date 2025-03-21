import { motion } from "framer-motion";
import PremiumSkillsChart from "./premium-skills-chart";
import { useLanguage } from "./language-provider";

export default function SkillsSection() {
  const { t } = useLanguage();

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("skills.title")}</h2>
        <p className="text-muted-foreground mb-12 max-w-3xl mx-auto">
          {t("skills.subtitle")}
        </p>
      </motion.div>

      <div className="mt-8">
        <PremiumSkillsChart />
      </div>
    </div>
  );
} 