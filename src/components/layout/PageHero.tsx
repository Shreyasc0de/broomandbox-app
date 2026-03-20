import type { ReactNode } from 'react';

import { motion } from 'motion/react';

interface PageHeroProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

const PageHero = ({ title, description, icon }: PageHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-primary py-20">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center text-white">
        {icon ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md"
          >
            {icon}
          </motion.div>
        ) : null}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-display font-bold md:text-6xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-2xl text-lg text-emerald-100"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
};

export default PageHero;
