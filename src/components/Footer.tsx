import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-forest/90 backdrop-blur-md text-warm-cream py-10 px-6 border-t border-gold/20">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8">
          <Link 
            to="/informovany-souhlas" 
            className="text-sm font-medium hover:text-gold transition-colors duration-300"
          >
            Informační souhlas
          </Link>
          <Link 
            to="/dotaznik" 
            className="text-sm font-medium hover:text-gold transition-colors duration-300"
          >
            Dotazník
          </Link>
          <Link 
            to="/diplomy" 
            className="text-sm font-medium hover:text-gold transition-colors duration-300"
          >
            Diplomy
          </Link>
          <Link 
            to="/kontakt" 
            className="text-sm font-medium hover:text-gold transition-colors duration-300"
          >
            Kontakt
          </Link>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/50" />
          <div className="w-2 h-2 rounded-full bg-gold/60" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/50" />
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-warm-cream/70">
          <Link 
            to="/admin" 
            className="hover:text-gold transition-colors duration-300"
          >
            Administrace
          </Link>

          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Zeman - koučink" 
              className="h-8 w-auto"
            />
            <p className="text-warm-cream/50">
              © {new Date().getFullYear()} Mgr. Bc. Ondřej Zeman. Všechna práva vyhrazena.
            </p>
          </div>
          
          <p className="font-body">
            webcreator{" "}
            <a 
              href="https://abano.monster" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gold hover:text-warm-cream transition-colors duration-300 font-display font-medium"
            >
              Abanooo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
