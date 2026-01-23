import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary/95 backdrop-blur-sm text-primary-foreground py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6">
          <Link 
            to="/informovany-souhlas" 
            className="text-sm hover:text-accent transition-colors"
          >
            Informovaný souhlas
          </Link>
          <Link 
            to="/dotaznik" 
            className="text-sm hover:text-accent transition-colors"
          >
            Dotazník
          </Link>
          <Link 
            to="/diplomy" 
            className="text-sm hover:text-accent transition-colors"
          >
            Diplomy
          </Link>
          <Link 
            to="/kontakt" 
            className="text-sm hover:text-accent transition-colors"
          >
            Kontakt
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-primary-foreground/20 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
          <Link 
            to="/admin" 
            className="hover:text-primary-foreground transition-colors"
          >
            Administrace
          </Link>
          
          <p>
            webcreator{" "}
            <a 
              href="https://abano.monster" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:text-primary-foreground transition-colors font-medium"
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
