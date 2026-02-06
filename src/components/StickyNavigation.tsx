import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

interface NavItem {
  label: string;
  href?: string;
  targetId?: string;
}

const navItems: NavItem[] = [
  { label: "O mně", targetId: "kdo-jsem" },
  { label: "Jak probíhá", targetId: "jak-probiha" },
  { label: "Reference", targetId: "reference" },
  { label: "FAQ", targetId: "faq" },
  { label: "Ceník", href: "/cenik" },
  { label: "Kontakt", href: "/kontakt" },
];

const StickyNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary/10 shadow-sm"
        >
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) =>
                  item.href ? (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.targetId!)}
                      className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  )
                )}
                <Link
                  to="/dotaznik"
                  className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Rezervovat
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-foreground"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.nav
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden overflow-hidden pb-4"
                >
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) =>
                      item.href ? (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="px-4 py-2 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          key={item.label}
                          onClick={() => scrollToSection(item.targetId!)}
                          className="px-4 py-2 text-left text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          {item.label}
                        </button>
                      )
                    )}
                    <Link
                      to="/dotaznik"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mx-4 mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium text-center hover:bg-primary/90 transition-colors"
                    >
                      Rezervovat konzultaci
                    </Link>
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default StickyNavigation;
