import { TextureLoader, LoadingManager, Group } from 'three';
import * as THREE from 'three';

// Asset loading utilities
export class AssetLoader {
  private textureLoader: TextureLoader;
  private loadingManager: LoadingManager;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.loadingManager = new LoadingManager();
    this.textureLoader = new TextureLoader(this.loadingManager);
  }

  // Load texture with caching
  async loadTexture(url: string): Promise<THREE.Texture> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    try {
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        this.textureLoader.load(
          url,
          (texture) => resolve(texture),
          undefined,
          (error) => reject(error)
        );
      });

      this.cache.set(url, texture);
      return texture;
    } catch (error) {
      console.error(`Failed to load texture: ${url}`, error);
      throw error;
    }
  }

  // Load GLTF model with caching (simplified for now)
  async loadModel(url: string): Promise<THREE.Group> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    try {
      // For now, return a simple group
      // TODO: Implement proper GLTF loading
      const group = new THREE.Group();
      this.cache.set(url, group);
      return group;
    } catch (error) {
      console.error(`Failed to load model: ${url}`, error);
      throw error;
    }
  }

  // Load multiple assets
  async loadAssets(assets: { type: 'texture' | 'model'; url: string }[]): Promise<Map<string, any>> {
    const results = new Map();

    const promises = assets.map(async (asset) => {
      try {
        let loadedAsset;
        if (asset.type === 'texture') {
          loadedAsset = await this.loadTexture(asset.url);
        } else if (asset.type === 'model') {
          loadedAsset = await this.loadModel(asset.url);
        }
        results.set(asset.url, loadedAsset);
      } catch (error) {
        console.error(`Failed to load asset: ${asset.url}`, error);
        results.set(asset.url, null);
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Clear cache
  clearCache(): void {
    this.cache.forEach((asset) => {
      if (asset.dispose) {
        asset.dispose();
      }
    });
    this.cache.clear();
  }

  // Get loading progress
  getLoadingProgress(): number {
    return 0; // Simplified for now
  }

  // Set loading callbacks
  setLoadingCallbacks(
    onLoad?: () => void,
    onProgress?: (url: string, loaded: number, total: number) => void,
    onError?: (url: string) => void
  ): void {
    if (onLoad) this.loadingManager.onLoad = onLoad;
    if (onProgress) this.loadingManager.onProgress = onProgress;
    if (onError) this.loadingManager.onError = onError;
  }
}

// Singleton instance
export const assetLoader = new AssetLoader();
