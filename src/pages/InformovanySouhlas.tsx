import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  title: string;
  items?: string[];
  text?: string;
}

interface InformacniSouhlasContent {
  intro: string;
  sections: Section[];
}

const InformovanySouhlas = () => {
  const [content, setContent] = useState<InformacniSouhlasContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "informacni_souhlas")
      .maybeSingle();

    if (data) {
      setContent(data.content as unknown as InformacniSouhlasContent);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLayout title="Informační souhlas">
        <p className="text-muted-foreground">Načítání...</p>
      </PageLayout>
    );
  }

  // Fallback content if database is empty
  const defaultContent: InformacniSouhlasContent = {
    intro: "Vážený klienti, před zahájením koučovacího procesu je důležité, abyste byli plně informováni o průběhu a podmínkách naší spolupráce.",
    sections: [
      {
        title: "Základní informace o koučinku",
        items: [
          "Koučink je partnerský vztah založený na důvěře a otevřené komunikaci",
          "Kouč neposkytuje rady ani řešení, ale podporuje klienta v hledání vlastních odpovědí",
          "Veškeré informace sdílené během sezení jsou důvěrné",
          "Klient má právo kdykoliv ukončit spolupráci"
        ]
      },
      {
        title: "Ochrana osobních údajů",
        text: "Vaše osobní údaje jsou zpracovávány v souladu s GDPR. Údaje jsou uchovávány pouze po dobu nezbytnou pro poskytování služeb a jsou chráněny před neoprávněným přístupem."
      },
      {
        title: "Souhlas klienta",
        text: "Podpisem tohoto dokumentu potvrzujete, že jste byli informováni o výše uvedených podmínkách a souhlasíte s nimi."
      }
    ]
  };

  const displayContent = content || defaultContent;

  return (
    <PageLayout title="Informační souhlas">
      <div className="space-y-6">
        <div className="flex justify-end print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Printer className="w-4 h-4" />
            Vytisknout
          </Button>
        </div>

        <div className="prose prose-lg max-w-none text-foreground/90 space-y-6">
          <p>{displayContent.intro}</p>

          {displayContent.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-display font-semibold text-primary mt-8 mb-4">
                {section.title}
              </h2>
              {section.items ? (
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              ) : section.text ? (
                <p className="text-foreground/80">{section.text}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default InformovanySouhlas;