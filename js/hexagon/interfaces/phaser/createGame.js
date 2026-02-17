// Hexagonal Interface: Phaser boot entrypoint
import { gameConfig } from '../../domain/config/GameConfig.js';
import { buildGameScenes } from '../../application/services/GameBootstrapService.js';

export function createHexagonalGame() {
  const config = {
    ...gameConfig,
    scene: buildGameScenes()
  };

  return new Phaser.Game(config);
}
