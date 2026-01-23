# Context Detail Inspector - Tab 1 Extensions

## 1. Rechter Paneel: Chat History

### Nieuwe sectie toevoegen:
- **Positie**: Rechterkant van het scherm, naast het chat window
- **Titel**: "History" of "Chat History"
- **Functionaliteit**: Toon eerdere chats met Kijko

### Layout:
```
[Source Files] [Chat Window] [Chat History]
    (links)       (midden)       (rechts)
```

### Structuur Chat History paneel:
- **Header**: "Chat History" met icoon (bijv. 🕐 of 📜)
- **Lijst van chats**:
  - Chronologisch gesorteerd (nieuwste bovenaan)
  - Elke chat item toont:
    - Datum/tijd (bijv. "Today, 14:30" of "Yesterday")
    - Preview van eerste vraag/onderwerp (1-2 regels)
    - Optioneel: aantal berichten in die chat
  - Klikbaar om die chat te laden

### Visual design:
- Vergelijkbare styling als Source Files paneel
- Scrollbare lijst
- Hover states voor items
- Active/selected state voor huidige chat
- Subtiele scheiding tussen chat items

### Acties per chat item:
- **Click**: Open die chat
- **Hover**: Toon meer preview of opties
- **Optioneel**: Delete/rename iconen bij hover

---

## 2. Ingeklapte State Source Files Paneel

### Huidige probleem:
- Ingeklapte versie is te smal (alleen een strip)
- Moet vergelijkbaar zijn met het uitgeklapte paneel maar smaller

### Nieuwe ingeklapte state:
- **Breedte ingeklapt**: ~150-200px (in plaats van ~40-50px)
- **Zichtbaar wanneer ingeklapt**:
  - "Source Files" header (smaller font)
  - Aantal geselecteerde files: "(12/12)"
  - Total size: "2.4 MB"
  - Collapse/expand icoon (▶)
  - Optioneel: Mini-iconen van geselecteerde files

### Layout ingeklapt paneel:
```
▶ Source Files
   12/12 • 2.4 MB
   ━━━━━━━━━━
   [mini file icons]
```

### Gedrag:
- **Uitgeklapt**: Normale breedte (~300-350px) met volledige lijst
- **Ingeklapt**: Smaller (~150-200px) maar nog steeds informatief
- **Smooth transitie**: 300-400ms tussen states
- **Click op ingeklapt paneel**: Klapt weer uit

### Visual design ingeklapt:
- Compacte maar leesbare weergave
- Zelfde kleurenschema en styling
- Mini file type iconen in raster/lijst
- Nog steeds functioneel en bruikbaar

---

## 3. Drie-kolom Layout

### Nieuwe screen layout:
```
┌─────────────┬──────────────────┬─────────────┐
│Source Files │   Chat Window    │Chat History │
│             │                  │             │
│  (links)    │     (midden)     │  (rechts)   │
│             │                  │             │
│ ◀ collapse  │                  │ collapse ▶  │
└─────────────┴──────────────────┴─────────────┘
```

### Responsive gedrag:
- **Beide panelen open**: Source Files | Chat | History
- **Links ingeklapt**: [▶] | Chat (breder) | History
- **Rechts ingeklapt**: Source Files | Chat (breder) | [◀]
- **Beide ingeklapt**: [▶] | Chat (maximale breedte) | [◀]

### Breedtes (voorbeeld):
- Source Files uitgeklapt: 300px
- Source Files ingeklapt: 180px
- Chat History uitgeklapt: 280px
- Chat History ingeklapt: 180px
- Chat window: flex (rest van ruimte)

---

## 4. Chat History Functionaliteit Details

### Data structuur:
```typescript
interface ChatHistoryItem {
  id: string;
  timestamp: Date;
  title: string; // auto-generated of user-edited
  preview: string; // eerste vraag
  messageCount: number;
  lastActivity: Date;
}
```

### Features:
- **New Chat knop**: Bovenaan Chat History paneel
- **Search/filter**: Zoek door oude chats
- **Groepering**: Per dag/week (Today, Yesterday, Last Week, etc.)
- **Context preservation**: Elke chat behoudt zijn source files selectie
- **Auto-save**: Chats worden automatisch opgeslagen

### Interacties:
- Click op chat → Laad die chat (inclusief history en source files)
- Huidige actieve chat is gemarkeerd/highlighted
- Long press of right-click → Context menu (rename, delete, export)

---

## 5. Collapse Functionaliteit voor Chat History

### Chat History paneel is ook inklapbaar:
- **Collapse knop**: Linksboven in Chat History paneel (◀ icoon)
- **Ingeklapte state**: Vergelijkbaar met Source Files
  - Breedte: ~150-200px
  - Toont: "History" header + aantal chats
  - Mini-lijst van recente chats (alleen titels/datums)

### Symmetrisch ontwerp:
- Beide panelen (links én rechts) hebben vergelijkbare inklapbare states
- Beide tonen nog steeds nuttige info wanneer ingeklapt
- Beide kunnen onafhankelijk in/uitgeklapt worden

---

## UI/UX Details

### Spacing en proporties:
- Consistent padding/margins tussen alle drie secties
- Smooth transitions bij het in/uitklappen
- Chat window blijft altijd zichtbaar en functioneel

### Visual hierarchy:
- Chat window (midden) blijft het belangrijkste element
- Side panels zijn ondersteunend maar niet afleidend
- Duidelijke scheiding tussen de drie secties

### Keyboard shortcuts (optioneel):
- `Ctrl/Cmd + B`: Toggle Source Files paneel
- `Ctrl/Cmd + H`: Toggle Chat History paneel
- `Ctrl/Cmd + N`: New chat
- `Ctrl/Cmd + K`: Focus op search in history

---

## Implementatie Checklist

### Chat History paneel:
- [ ] Rechter paneel container creëren
- [ ] Chat history lijst component
- [ ] Chat item component met preview
- [ ] Click handlers om chats te laden
- [ ] Groepering per datum/tijd
- [ ] New Chat knop functionality
- [ ] Delete/rename opties
- [ ] Active chat highlighting

### Ingeklapte states:
- [ ] Source Files ingeklapte versie verbeteren (150-200px)
- [ ] Compact info tonen: files count, size
- [ ] Mini file icons weergave
- [ ] Chat History ingeklapte versie maken
- [ ] Smooth transitions voor beide panelen
- [ ] Click-to-expand functionaliteit

### Layout & Responsive:
- [ ] Drie-kolom layout implementeren
- [ ] Flexible chat window width
- [ ] Beide panelen onafhankelijk inklapbaar
- [ ] Proper spacing en margins
- [ ] Responsive gedrag testen

### State Management:
- [ ] Collapsed state per paneel bijhouden
- [ ] Chat history data structure
- [ ] Active chat tracking
- [ ] Source files per chat onthouden
- [ ] LocalStorage voor persistence

---

## Visual Reference

Zie bijgevoegde screenshots voor:
- Screenshot 1 (groen omcirkeld): Ingeklapte linker paneel moet smaller maar informatief blijven
- Screenshot 2 (groene/rode markeringen): Gewenste layout met drie secties

Het doel is een flexibele, informatieve interface waarbij gebruikers:
- Source files kunnen beheren (links)
- Chatten met Kijko (midden)
- Door chat history kunnen navigeren (rechts)
- Elk paneel kunnen in/uitklappen voor meer ruimte
