import { Injectable, signal } from '@angular/core';
import { RadioBrowserStation } from './radio-browser/radio-browser-api.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): any {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  clear(key: string): void {
    localStorage.removeItem(key);
  }

  recent = signal<RadioBrowserStation[]>([]);

  addRecent(station: RadioBrowserStation) {
    let recent: RadioBrowserStation[] = this.get('recent') ?? [];

    // Remove if already exists
    recent = recent.filter(
      (item: RadioBrowserStation) => item.stationuuid !== station.stationuuid
    );

    // Add to the front
    recent = [station, ...recent];

    // Cap to 20
    const cappedRecent = recent.slice(0, 20);

    this.set('recent', cappedRecent);

    this.recent.set(cappedRecent);
  }

  favorites = signal<RadioBrowserStation[]>([]);

  getRecent() {
    const recent = this.get('recent') ?? [];
    this.recent.set(recent);
  }

  getFavorites() {
    const favorites = this.get('favorites') ?? [];
    this.favorites.set(favorites);
  }

  toggleFavorite(station: RadioBrowserStation) {
    const isFavorite = this.isFavorite(station.stationuuid);

    if (isFavorite) {
      this.removeFavorite(station);
    } else {
      this.addFavorite(station);
    }
  }

  private addFavorite(station: RadioBrowserStation) {
    const favorites = this.get('favorites') ?? [];

    favorites.push(station);
    this.set('favorites', favorites);
    this.favorites.set(favorites);
  }

  private removeFavorite(station: RadioBrowserStation) {
    const favorites = this.get('favorites') ?? [];
    const updatedFavorites = favorites.filter(
      (favorite: RadioBrowserStation) =>
        favorite.stationuuid !== station.stationuuid
    );
    this.set('favorites', updatedFavorites);
    this.favorites.set(updatedFavorites);
  }

  isFavorite(stationuuid: string) {
    return this.favorites().some(
      (favorite: RadioBrowserStation) => favorite.stationuuid === stationuuid
    );
  }
}
