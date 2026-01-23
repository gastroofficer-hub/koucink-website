import PageLayout from "@/components/PageLayout";

const InformovanySouhlas = () => {
  return (
    <PageLayout title="Informovaný souhlas">
      <div className="prose prose-lg max-w-none text-foreground/90 space-y-6">
        <p>
          Vážený klienti, před zahájením koučovacího procesu je důležité, abyste byli plně informováni 
          o průběhu a podmínkách naší spolupráce.
        </p>

        <h2 className="text-xl font-display font-semibold text-primary mt-8 mb-4">
          Základní informace o koučinku
        </h2>
        <ul className="list-disc list-inside space-y-2 text-foreground/80">
          <li>Koučink je partnerský vztah založený na důvěře a otevřené komunikaci</li>
          <li>Kouč neposkytuje rady ani řešení, ale podporuje klienta v hledání vlastních odpovědí</li>
          <li>Veškeré informace sdílené během sezení jsou důvěrné</li>
          <li>Klient má právo kdykoliv ukončit spolupráci</li>
        </ul>

        <h2 className="text-xl font-display font-semibold text-primary mt-8 mb-4">
          Ochrana osobních údajů
        </h2>
        <p className="text-foreground/80">
          Vaše osobní údaje jsou zpracovávány v souladu s GDPR. Údaje jsou uchovávány pouze po dobu 
          nezbytnou pro poskytování služeb a jsou chráněny před neoprávněným přístupem.
        </p>

        <h2 className="text-xl font-display font-semibold text-primary mt-8 mb-4">
          Souhlas klienta
        </h2>
        <p className="text-foreground/80">
          Podpisem tohoto dokumentu potvrzujete, že jste byli informováni o výše uvedených podmínkách 
          a souhlasíte s nimi.
        </p>
      </div>
    </PageLayout>
  );
};

export default InformovanySouhlas;
