// Hexagonal Application service: build runtime scene set
import { PreloadScene, MenuScene, ControlsConfigScene, SelectScene, MapSelectScene, PlayScene } from '../../infrastructure/phaser/scenes/index.js';

export function buildGameScenes() {
  return [PreloadScene, MenuScene, ControlsConfigScene, SelectScene, MapSelectScene, PlayScene];
}
