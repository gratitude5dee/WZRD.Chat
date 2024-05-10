import { getServerConfig } from '@/config/server';

interface KeyStore {
  index: number;
  keyLen: number;
  keys: string[];
}

export class ApiKeyManager {
  private _cache: Map<string, KeyStore> = new Map();

  private _mode: string;

  constructor() {
    const { API_KEY_SELECT_MODE: mode = 'random' } = getServerConfig();

    this._mode = mode;
  }

  private getKeyStore(apiKeyIdentifier: string): KeyStore {
    let store = this._cache.get(apiKeyIdentifier);

    if (!store) {
      console.error(`No keys found for API Key Identifier: ${apiKeyIdentifier}`);
      throw new Error(`API keys are missing or malformed for ${apiKeyIdentifier}`);
      const keys = apiKeyIdentifier.split(',').filter(key => !!key.trim());
      store = { index: 0, keyLen: keys.length, keys };
      this._cache.set(apiKeyIdentifier, store);
    }

    if (store.keys.length === 0) {
      console.error(`Malformed keys detected for ${apiKeyIdentifier}`);
      throw new Error(`Every key is invalid or malformed in ${apiKeyIdentifier}`);
    }

    return store;
  }

  pick(apiKeyIdentifier: string = ''): string {
    if (!apiKeyIdentifier) return '';

    let store;
    try {
      store = this.getKeyStore(apiKeyIdentifier);
    } catch (error) {
      console.error(error.message);
      return '';
    }
    let index = 0;

    if (this._mode === 'turn') {
      index = store.index++ % store.keyLen;
    } else if (this._mode === 'random') {
      index = Math.floor(Math.random() * store.keyLen);
    }

    return store.keys[index];
  }
}

export default new ApiKeyManager();
