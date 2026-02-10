

## Dark Mode Toggle

Pridani prepinace svetly/tmavy rezim do webu. Projekt uz ma definovane `.dark` CSS promenne v `src/index.css`, takze staci pridat logiku prepinani.

### Co se udela

1. **Vytvoreni komponenty `ThemeToggle`** (`src/components/ThemeToggle.tsx`)
   - Tlacitko s ikonami slunce/mesice (z lucide-react)
   - Prepina tridu `dark` na elementu `<html>`
   - Uklada preferenci do `localStorage`
   - Pouzije animaci prechodu (framer-motion)

2. **Umisteni do `StickyNavigation`**
   - Na desktopu: vedle tlacitka "Rezervace" (pred nim)
   - Na mobilu: v mobilnim menu dole

3. **Umisteni na hlavni strance**
   - Fixni pozice v pravem hornim rohu (kdyz neni sticky navigace viditelna)

### Technicke detaily

- Komponenta `ThemeToggle` bude pouzivat `useState` + `useEffect` pro cteni/zapis do `localStorage` a prepinani tridy `dark` na `document.documentElement`
- Pri prvnim nacteni se respektuje systemova preference (`prefers-color-scheme: dark`)
- Tmave CSS promenne uz existuji v `src/index.css` (blok `.dark {}`)
- Ikony: `Sun` a `Moon` z `lucide-react`
- Tailwind je nakonfigurovan s `darkMode: ["class"]`, takze vse je pripraveno

