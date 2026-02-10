import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Cookie className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Soukromí a cookies
                </h3>
                <p className="text-sm text-foreground/70">
                  Tento web používá cookies pro zajištění správného fungování a analýzu návštěvnosti. 
                  Používáním webu souhlasíte s{" "}
                  <a href="/informovany-souhlas" className="text-primary underline hover:text-accent">
                    podmínkami zpracování údajů
                  </a>.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  className="border-primary/30"
                >
                  Odmítnout
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                >
                  Přijmout vše
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
