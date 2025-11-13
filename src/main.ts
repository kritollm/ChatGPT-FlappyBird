import './styles/main.css';

interface Game {
  id: string;
  title: string;
  icon: string;
  description: string;
  load: () => Promise<void>;
}

const games: Game[] = [
  {
    id: 'flappy-bird',
    title: 'FLAPPY BIRD',
    icon: '🐦',
    description: 'Klassisk Flappy Bird med Amiga-estetikk og chiptune musikk',
    load: async () => {
      const { default: loadGame } = await import('./games/flappy-bird/game');
      await loadGame();
    }
  },
  {
    id: 'cyber-miner',
    title: 'CYBER MINER',
    icon: '⚡',
    description: 'Puzzle-spill i cyberpunk stil - samle kjerneenergier og unngå blokker',
    load: async () => {
      const { default: loadGame } = await import('./games/cyber-miner/game');
      await loadGame();
    }
  },
  {
    id: 'thunder-strike',
    title: 'THUNDER STRIKE',
    icon: '⚡',
    description: 'EPISK 90-talls shoot em up! Romskip, eksplo sjoner, power-ups og boss-kamper!',
    load: async () => {
      const { default: loadGame } = await import('./games/thunder-strike/game');
      await loadGame();
    }
  },
  {
    id: 'space-blaster',
    title: 'SPACE BLASTER',
    icon: '👾',
    description: '80-talls arcade shoot em up - ødelegg fiender, samle power-ups, overlev bølger!',
    load: async () => {
      const { default: loadGame } = await import('./games/space-blaster/game');
      await loadGame();
    }
  }
];

class ArcadeHub {
  private app: HTMLElement;
  private currentGame: string | null = null;

  constructor() {
    this.app = document.getElementById('app')!;
    this.showMenu();
  }

  private showMenu(): void {
    this.currentGame = null;
    this.app.innerHTML = `
      <div class="menu-container">
        <h1 class="menu-title" data-text="ARCADE HUB">
          🎮 ARCADE HUB
        </h1>
        <div class="game-grid">
          ${games.map(game => `
            <div class="game-card" data-game="${game.id}">
              <div class="game-icon">${game.icon}</div>
              <h2 class="game-title">${game.title}</h2>
              <p class="game-description">${game.description}</p>
            </div>
          `).join('')}
        </div>
        <div class="menu-footer">
          Trykk på et spill for å starte · Optimalisert for mobil og desktop
        </div>
      </div>
    `;

    // Add click handlers
    this.app.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const gameId = (e.currentTarget as HTMLElement).dataset.game;
        if (gameId) {
          this.loadGame(gameId);
        }
      });
    });
  }

  private async loadGame(gameId: string): Promise<void> {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    this.currentGame = gameId;

    // Show loading
    this.app.innerHTML = `
      <div class="loading">Laster ${game.title}</div>
    `;

    try {
      // Clear app content
      this.app.innerHTML = '';

      // Add back button
      const backButton = document.createElement('a');
      backButton.href = '#';
      backButton.className = 'back-button';
      backButton.innerHTML = '←';
      backButton.onclick = (e) => {
        e.preventDefault();
        this.exitGame();
      };
      document.body.appendChild(backButton);

      // Load the game
      await game.load();
    } catch (error) {
      console.error('Feil ved lasting av spill:', error);
      this.app.innerHTML = `
        <div class="menu-container">
          <h2 style="color: var(--accent); text-align: center;">
            Kunne ikke laste spillet
          </h2>
          <button onclick="location.reload()" style="margin: 20px auto; display: block;">
            Prøv igjen
          </button>
        </div>
      `;
    }
  }

  private exitGame(): void {
    // Remove back button
    const backButton = document.querySelector('.back-button');
    if (backButton) {
      backButton.remove();
    }

    // Clean up game
    this.app.innerHTML = '';

    // Stop any audio
    if (typeof window !== 'undefined' && (window as any).Howler) {
      (window as any).Howler.stop();
    }

    // Stop music
    if (typeof window !== 'undefined' && (window as any).stopMusic) {
      (window as any).stopMusic();
    }

    // Show menu
    this.showMenu();
  }
}

// Initialize app
new ArcadeHub();
