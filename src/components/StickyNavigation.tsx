import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

interface NavItem {
  label: string;
  href?: string;
  targetId?: string;
}

interface DropdownItem {
  label: string;
  href: string;
  isScroll?: boolean;
  targetId?: string;
}

const scrollItems: NavItem[] = [
  { label: "Kdo jsem?", targetId: "kdo-jsem" },
  { label: "Proč se mnou?", targetId: "proc-se-mnou" },
  { label: "Reference", targetId: "reference" },
  { label: "FAQ", targetId: "faq" },
];


const dropdownItems: DropdownItem[] = [
  { label: "Jak probíhá koučink?", href: "/#jak-probiha", isScroll: true, targetId: "jak-probiha" },
  { label: "Etický kodex", href: "/eticky-kodex" },
  { label: "Diplomy", href: "/diplomy" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Blog", href: "/blog" },
  { label: "Informovaný souhlas", href: "/informovany-souhlas" },
];

const StickyNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary/10 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {/* Scroll sections */}
                {scrollItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.targetId!)}
                    className="relative px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg transition-colors group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-3/4" />
                  </button>
                ))}

                {/* Ceník as main item */}
                <Link
                  to="/cenik"
                  className="relative px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg transition-colors group"
                >
                  Ceník
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-3/4" />
                </Link>

                {/* Dropdown for pages */}
                <div className="relative dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="relative px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg transition-colors inline-flex items-center gap-1 group"
                  >
                    Více
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-primary/10 overflow-hidden z-50"
                      >
                        <div className="py-2">
                          {dropdownItems.map((item) => 
                            item.isScroll ? (
                              <button
                                key={item.label}
                                onClick={() => scrollToSection(item.targetId!)}
                                className="block w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                              >
                                {item.label}
                              </button>
                            ) : (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsDropdownOpen(false)}
                                className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                              >
                                {item.label}
                              </Link>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/dotaznik"
                  className="ml-3 px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  Rezervace
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-foreground"
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
                  className="lg:hidden overflow-hidden pb-4"
                >
                  <div className="flex flex-col gap-1">
                    {/* Section heading */}
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Na stránce
                    </p>
                    {scrollItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => scrollToSection(item.targetId!)}
                        className="px-4 py-2.5 text-left text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}

                    {/* Divider */}
                    <div className="my-2 border-t border-primary/10" />

                    {/* Pages heading */}
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Stránky
                    </p>
                    {dropdownItems.map((item) => 
                      item.isScroll ? (
                        <button
                          key={item.label}
                          onClick={() => scrollToSection(item.targetId!)}
                          className="w-full text-left px-4 py-2.5 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2.5 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          {item.label}
                        </Link>
                      )
                    )}

                    {/* CTA */}
                    <Link
                      to="/dotaznik"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mx-4 mt-3 px-4 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium text-center hover:bg-primary/90 transition-colors"
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
