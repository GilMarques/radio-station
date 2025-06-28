import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CacheService } from '../../services/cache.service';
import { RadioBrowserStation } from '../../services/radio-browser/radio-browser-api.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<RadioBrowserStation[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private cacheService: CacheService) {}

  toggleFavorite(station: RadioBrowserStation) {
    const favorites = this.cacheService.get('favorites') ?? [];
    const isFavorite = favorites.some(
      (favorite: RadioBrowserStation) =>
        favorite.stationuuid === station.stationuuid
    );

    if (isFavorite) {
      this.removeFavorite(station);
    } else {
      this.addFavorite(station);
    }
  }

  addFavorite(station: RadioBrowserStation) {
    const favorites = this.cacheService.get('favorites') ?? [];

    favorites.push(station);
    this.cacheService.set('favorites', favorites);
    this.favoritesSubject.next(favorites);
  }

  removeFavorite(station: RadioBrowserStation) {
    const favorites =
      this.cacheService.get('favorites') ?? ([] as RadioBrowserStation[]);
    const updatedFavorites = favorites.filter(
      (favorite: RadioBrowserStation) =>
        favorite.stationuuid !== station.stationuuid
    );
    this.cacheService.set('favorites', updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
  }
}
