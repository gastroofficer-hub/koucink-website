

# Plán: Přidání sekce Reference (Testimonials)

## Přehled

Přidám novou sekci **Reference** do webu, která umožní zobrazovat anonymizované ohlasy klientů. Sekce bude plně editovatelná z administrace a zobrazí se na hlavní stránce.

---

## Co bude implementováno

### 1. Databázová tabulka pro reference

Vytvořím novou tabulku `testimonials` pro ukládání referencí:
- **text** - text reference (citát klienta)
- **author_name** - jméno/přezdívka autora (např. "Jana K." nebo "Anonymní klient")
- **author_role** - volitelný popis (např. "Podnikatelka", "IT manažer")
- **is_visible** - zda je reference viditelná na webu
- **order_index** - pořadí zobrazení

### 2. Komponenta pro zobrazení referencí

Vytvořím komponentu `TestimonialsSection.tsx`:
- Elegantní design s citačními značkami
- Animace při scrollování (konzistentní s ostatními sekcemi)
- Karusel nebo grid layout pro více referencí
- Responzivní design

### 3. Administrace referencí

Vytvořím `TestimonialsManagement.tsx`:
- Přidávání/úprava/mazání referencí
- Přepínání viditelnosti
- Změna pořadí (drag & drop nebo šipky)
- Logování změn do historie

### 4. Integrace na hlavní stránku

- Přidám sekci Reference mezi "Jak probíhá koučink" a Footer
- Přidám navigační kartu "Reference" do menu (ikona MessageCircle nebo Quote)

---

## Vizuální návrh

```text
┌─────────────────────────────────────────────────────────┐
│                      Reference                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │     "         " │  │     "         " │               │
│  │  Koučink mi     │  │  Ondřej mi      │               │
│  │  pomohl najít   │  │  pomohl získat  │               │
│  │  směr...        │  │  nadhled...     │               │
│  │                 │  │                 │               │
│  │  — Jana K.      │  │  — Petr M.      │               │
│  │  Podnikatelka   │  │  IT manažer     │               │
│  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## Technické detaily

### Databáze (SQL migrace)

```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_role VARCHAR(100),
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS politiky pro čtení (veřejné) a zápis (pouze admin)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone" 
  ON testimonials FOR SELECT 
  USING (is_visible = true);

CREATE POLICY "Admins can manage testimonials" 
  ON testimonials FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );
```

### Nové soubory

| Soubor | Popis |
|--------|-------|
| `src/components/TestimonialsSection.tsx` | Komponenta pro zobrazení referencí |
| `src/components/admin/TestimonialsManagement.tsx` | Správa referencí v admin panelu |

### Upravené soubory

| Soubor | Změny |
|--------|-------|
| `src/pages/Index.tsx` | Přidání sekce Reference + navigační karta |
| `src/pages/Admin.tsx` | Přidání tabu "Reference" |

---

## Pořadí navigačních karet (aktualizované)

1. Kdo jsem
2. Proč se mnou
3. Jak probíhá koučink
4. **Reference** (nové)
5. Etický kodex
6. Diplomy
7. Kontakt
8. Blog
9. Rezervace
10. Ceník
11. Informovaný souhlas

---

## Shrnutí

- **1 nová tabulka** v databázi s RLS
- **2 nové komponenty** (zobrazení + admin správa)
- **2 upravené soubory** (Index.tsx, Admin.tsx)
- Plně editovatelné z administrace
- Konzistentní design s ostatními sekcemi webu

