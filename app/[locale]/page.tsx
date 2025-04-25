"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const Home = (): React.ReactNode => {
  const t = useTranslations("home");
  const [scrollY, setScrollY] = useState(0);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoSwipeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const features = [
    {
      title: t("easyToUse"),
      description: t("easyToUseDesc"),
      image: "/snapform/easy-to-use.png",
    },
    {
      title: t("customizable"),
      description: t("customizableDesc"),
      image: "/snapform/customize.png",
    },
    {
      title: t("responsive"),
      description: t("responsiveDesc"),
      image: "/snapform/responsive.png",
    },
    {
      title: "Multiple Field Types",
      description:
        "Choose from text, email, number, textarea, select, radio, checkbox, and date fields.",
      image: "/snapform/customize.png",
    },
    {
      title: "Form Analytics",
      description:
        "Track responses, completion rates, and user engagement with detailed analytics.",
      image: "/snapform/analytics.png",
    },
    {
      title: "Secure & Reliable",
      description:
        "Your data is protected with industry-standard security measures and encryption.",
      image: "/snapform/secure.png",
    },
    {
      title: t("dragAndDrop"),
      description: t("dragAndDropDesc"),
      image: "/snapform/easy-to-use.png",
    },
    {
      title: t("livePreview"),
      description: t("livePreviewDesc"),
      image: "/snapform/live-preview.png",
    },
    {
      title: t("customThemes"),
      description: t("customThemesDesc"),
      image: "/snapform/customize.png",
    },
  ];

  const handleMouseEnter = () => {
    if (autoSwipeTimerRef.current) {
      clearInterval(autoSwipeTimerRef.current);
    }

    autoSwipeTimerRef.current = setInterval(() => {
      setActiveFeatureIndex((prevIndex) =>
        prevIndex === features.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (autoSwipeTimerRef.current) {
      clearInterval(autoSwipeTimerRef.current);
      autoSwipeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (autoSwipeTimerRef.current) {
        clearInterval(autoSwipeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />

        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/20 blur-3xl animate-pulse" />

        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(var(--primary),0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_15s_ease_infinite]" />

        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.1)_1px,transparent_1px)] bg-[size:3rem_3rem]"
          style={{ backgroundPositionY: `${scrollY * 0.2}px` }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary),0.1)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 pt-16 lg:pt-24 relative z-10">
        <div className="flex flex-col items-center gap-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.svg"
              alt="Snapform Logo"
              width={120}
              height={120}
              priority
              className="dark:invert drop-shadow-xl"
            />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {t("createForms")}{" "}
            <span className="italic bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              {t("effortlessly")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-[700px] text-xl leading-relaxed text-foreground/80"
          >
            {t("buildForms")}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 mt-4"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                {t("loginToDashboard")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 border-2"
              >
                {t("signUp")}
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center mt-24 mb-8"
        >
          <div className="relative w-full max-w-4xl h-[300px] sm:h-[400px] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="/dash.png"
              alt="Form Builder Dashboard"
              fill
              style={{ objectFit: "cover" }}
              className="hover:scale-105 object-top hover:object-bottom transition-all duration-1000 ease-in-out"
            />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-semibold">
                Powerful Form Builder Dashboard
              </h3>
              <p className="text-sm text-white/80">
                Create, manage, and analyze all your forms in one place
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          <span className="relative inline-block">
            {t("whyChoose")}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground max-w-2xl mx-auto mb-16"
        >
          Snapform provides all the tools you need to create beautiful,
          functional forms without any coding
        </motion.p>

        <div
          ref={carouselRef}
          className="relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            className="flex flex-nowrap"
            animate={{
              x: `-${activeFeatureIndex * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 150, damping: 30 }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                className="w-full shrink-0 flex flex-col md:flex-row"
              >
                <div className="w-full md:w-1/2 p-6">
                  <Card
                    className={`h-full overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      activeFeatureIndex === i
                        ? "border-primary/100 scale-105"
                        : "border-primary/30"
                    }`}
                  >
                    <CardContent className="p-0 h-full">
                      <div
                        className={`w-full h-80 flex items-center justify-center transition-all duration-500 relative ${
                          activeFeatureIndex === i ? "" : "grayscale"
                        }`}
                      >
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover object-top"
                          priority={i === 0}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="w-full md:w-1/2 p-6">
                  <div
                    className={`h-full flex flex-col justify-center transition-opacity duration-500 ${
                      activeFeatureIndex === i ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-foreground/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeFeatureIndex === i ? "bg-primary w-6" : "bg-primary/30"
                }`}
                onClick={() => setActiveFeatureIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 my-10 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-md relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("readyToStart")}
            </h2>
            <p className="text-xl text-foreground/80 mb-10">{t("joinUsers")}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  {t("signUp")}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 border-2"
                >
                  {t("loginToDashboard")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="bg-card/80 backdrop-blur-md py-12 relative z-10 border-t border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-6 md:mb-0">
              <Image
                src="/logo.svg"
                alt="Snapform Logo"
                width={40}
                height={40}
                className="dark:invert"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Snapform
              </h1>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
