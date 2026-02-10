import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

const BASE_URL = "https://zeman-coach.lovable.app";
const DEFAULT_TITLE = "Ondřej Zeman | Profesionální koučink pro osobní i profesní rozvoj";
const DEFAULT_DESCRIPTION = "Certifikovaný kouč Mgr. Bc. Ondřej Zeman. Pomohu vám překonat překážky, dosáhnout cílů a objevit svůj potenciál. Online i osobní koučink v Lanškrouně.";

const SEOHead = ({ title, description, path = "" }: SEOHeadProps) => {
  const fullTitle = title ? `${title} | Ondřej Zeman - Koučink` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
};

export default SEOHead;
