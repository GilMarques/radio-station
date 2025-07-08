import { Injectable, signal } from '@angular/core';
import { RadioBrowserApi } from './radio-browser/radio-browser-api.model';

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

  recent = signal<RadioBrowserApi.Station[]>([]);

  addRecent(station: RadioBrowserApi.Station) {
    let recent: RadioBrowserApi.Station[] = this.get('recent') ?? [];

    // Remove if already exists
    recent = recent.filter(
      (item: RadioBrowserApi.Station) =>
        item.stationuuid !== station.stationuuid
    );

    // Add to the front
    recent = [station, ...recent];

    // Cap to 20
    const cappedRecent = recent.slice(0, 20);

    this.set('recent', cappedRecent);

    this.recent.set(cappedRecent);
  }

  favorites = signal<RadioBrowserApi.Station[]>([]);

  getRecent() {
    const recent = this.get('recent') ?? [];
    this.recent.set(recent);
  }

  getFavorites() {
    const favorites = this.get('favorites') ?? [];
    this.favorites.set(favorites);
  }

  toggleFavorite(station: RadioBrowserApi.Station) {
    const isFavorite = this.isFavorite(station.stationuuid);

    if (isFavorite) {
      this.removeFavorite(station);
    } else {
      this.addFavorite(station);
    }
  }

  private addFavorite(station: RadioBrowserApi.Station) {
    const favorites = this.get('favorites') ?? [];

    favorites.push(station);
    this.set('favorites', favorites);
    this.favorites.set(favorites);
  }

  private removeFavorite(station: RadioBrowserApi.Station) {
    const favorites = this.get('favorites') ?? [];
    const updatedFavorites = favorites.filter(
      (favorite: RadioBrowserApi.Station) =>
        favorite.stationuuid !== station.stationuuid
    );
    this.set('favorites', updatedFavorites);
    this.favorites.set(updatedFavorites);
  }

  isFavorite(stationuuid: string) {
    return this.favorites().some(
      (favorite: RadioBrowserApi.Station) =>
        favorite.stationuuid === stationuuid
    );
  }
}
