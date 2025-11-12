# 🎮 ARCADE HUB - Retro Gaming Collection

En moderne samling av addictive retro-spill med cyberpunk og Amiga-estetikk, bygget med Vite, TypeScript og moderne web-teknologi.

## 🎯 Spill

### 🐦 Flappy Bird - Amiga Edition
Klassisk Flappy Bird-gameplay med:
- Retro Amiga-estetikk med neon-farger
- Chiptune-musikk med equalizer-visualisering
- Power-ups (Shield, 2x Multiplier, Slow-Mo, Magnet, Star)
- Achievement-system
- Partikkeleffekter og screen shake
- Combo-system
- Mynter å samle
- Animerte vinger på fuglen

### ⚡ Cyber Miner
Original puzzle-action spill med:
- Grid-basert gameplay
- Cyberpunk-tema med neon-estetikk
- Fallende blokker-mekanikk
- Time-attack gameplay
- Combo-system for høyere score
- Progressive vanskelighetsgrad
- Retro synthesizer-musikk

## 🚀 Utvikling

### Forutsetninger
- Node.js (v16 eller nyere)
- npm eller yarn

### Installasjon

```bash
# Installer dependencies
npm install

# Start development server
npm run dev

# Bygg for produksjon
npm run build

# Preview produksjonsbygg
npm run preview
```

## 📱 Funksjoner

### Mobilvennlig
- Responsiv design som fungerer på alle enheter
- Touch-kontroller for mobil
- Optimalisert for både portrett og landskap-modus
- PWA-klar (Progressive Web App)

### Modern Arkitektur
- ⚡️ Vite for rask utvikling og building
- 📦 TypeScript for type-sikkerhet
- 🎨 Moderne CSS med animasjoner
- 🎮 Modularisert spillkode
- 🔥 Hot Module Replacement (HMR)

### Ekstremt Addictive
- Smooth animasjoner og overganger
- Partikkeleffekter
- Audio-feedback
- Achievement-system
- High score tracking
- Combo-system

## 🎮 Kontroller

### Flappy Bird
- **Mus/Touch**: Klikk eller trykk for å fly
- **Tastatur**: SPACE for å fly
- **Hold SPACE**: Redusert gravitasjon

### Cyber Miner
- **Tastatur**: WASD eller piltaster for bevegelse
- **Touch**: On-screen kontroller på mobil
- **Mål**: Samle alle energy cores og nå exit-portalen

## 🏗️ Prosjektstruktur

```
ChatGPT-FlappyBird/
├── src/
│   ├── main.ts              # Entry point og hovedmeny
│   ├── styles/
│   │   └── main.css         # Global styling
│   ├── games/
│   │   ├── flappy-bird/
│   │   │   └── game.ts      # Flappy Bird spill
│   │   └── cyber-miner/
│   │       └── game.ts      # Cyber Miner spill
│   ├── gfx/                 # Grafikk-ressurser
│   └── sound/               # Lyd-ressurser
├── index.html               # HTML entry point
├── vite.config.ts           # Vite konfigurasjon
├── tsconfig.json            # TypeScript konfigurasjon
└── package.json             # Dependencies
```

## 🎨 Designfilosofi

### Retro-Moderne Fusjon
- Kombinerer nostalgisk pixel-art estetikk med moderne web-teknologi
- Neon cyberpunk-fargepalett (#00ffff, #ff00ff, #ff0066)
- Smooth animasjoner og overganger
- Particle systems for visuell feedback

### UX-Fokus
- Intuitiv navigasjon
- Immediate feedback på brukerhandlinger
- Forklarende tekster og instruksjoner
- Progresjon og belønningssystemer

## 🔧 Teknologi

- **Vite** - Next generation frontend tooling
- **TypeScript** - Type-safe JavaScript
- **Canvas API** - 2D grafikk rendering
- **Web Audio API** - Chiptune musikk og lydeffekter
- **Howler.js** - Audio management
- **seedrandom** - Deterministic random for replay

## 📄 Lisens

Dette prosjektet inneholder originale spill-implementasjoner med inspirasjon fra klassiske arkade-spill.

## 🤝 Bidrag

Bidrag er velkomne! Ta kontakt eller lag en pull request.

## 🎵 Lyd og Musikk

- Procedurally generated chiptune-musikk
- Web Audio API-baserte lydeffekter
- Retro synthesizer-lyder
- Equalizer-visualisering

## 🏆 Features Highlight

- ✅ Zero config setup med Vite
- ✅ Full TypeScript-støtte
- ✅ Mobil-optimalisert
- ✅ Retro-estetikk
- ✅ Multiple spill i én app
- ✅ Achievement system
- ✅ High score tracking
- ✅ Audio visualisering
- ✅ Particle effects
- ✅ Screen shake
- ✅ Combo system
- ✅ Power-ups

Nyt spillingen! 🎮✨
