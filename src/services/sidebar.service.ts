import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { RadioBrowserStation } from './radio-browser/radio-browser-api.model';

import { HttpClient } from '@angular/common/http';
import { RadioBrowserApiService } from './radio-browser/radio-browser-api.service';
import { StorageService } from './storage.service';
import { Palette } from './vibrant.model';

import { Vibrant } from 'node-vibrant/browser';

type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'popularity-asc'
  | 'popularity-desc'
  | 'trending-asc'
  | 'trending-desc'
  | 'none'; // Added 'none' for default sorting
@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  radioBrowserService = inject(RadioBrowserApiService);

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject
    .asObservable()
    .pipe(debounceTime(100), distinctUntilChanged());

  private sortOptionSubject = new BehaviorSubject<SortOption>('none');
  sortOption$ = this.sortOptionSubject.asObservable();

  private countryCodeSubject = new BehaviorSubject<string>('pt');
  countryCode$ = this.countryCodeSubject.asObservable();

  setSortOption(
    sortKey: 'name' | 'popularity' | 'trending' | 'none',
    sortDirection?: 'asc' | 'desc'
  ) {
    if (sortKey === 'none') {
      this.sortOptionSubject.next('none');
      return;
    }
    this.sortOptionSubject.next(`${sortKey}-${sortDirection!}`);
  }

  private useOverride$ = new BehaviorSubject<boolean>(false);
  private overrideStations$ = new BehaviorSubject<RadioBrowserStation[]>([]);

  setOverrideStations(stations: RadioBrowserStation[]) {
    this.overrideStations$.next(stations);
    this.useOverride$.next(true);
  }

  // To disable override and go back to live data
  disableOverride() {
    this.useOverride$.next(false);
  }

  stations$ = combineLatest([this.useOverride$, this.countryCode$]).pipe(
    switchMap(([useOverride, countryCode]) => {
      if (useOverride) {
        return this.overrideStations$;
      } else {
        return this.radioBrowserService.getStationsByCountryCode$(countryCode);
      }
    })
  );

  filteredStations$ = combineLatest([
    this.stations$,
    this.searchTerm$,
    this.sortOption$,
  ]).pipe(
    map(([stations, term, sortOption]) => {
      const filtered = stations.filter((station) =>
        this.normalizeString(station.name).includes(this.normalizeString(term))
      );

      return this.sortStations(filtered, sortOption);
    }),

    tap((stations) => {
      this.filteredStationsList = stations;
      console.log(stations);
    })
  );

  private normalizeString(str: string): string {
    return str
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
      .toLowerCase(); // Convert to lowercase
  }

  private sortStations(
    stations: RadioBrowserStation[],
    sortOption: SortOption
  ): RadioBrowserStation[] {
    if (sortOption === 'none') return stations;

    return stations.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'popularity-asc':
          return b.clickcount - a.clickcount;
        case 'popularity-desc':
          return a.clickcount - b.clickcount;
        case 'trending-asc':
          return b.clicktrend - a.clicktrend;
        case 'trending-desc':
          return a.clicktrend - b.clicktrend;
        default:
          return 0;
      }
    });
  }

  filteredStationsList: RadioBrowserStation[] = [];

  paletteMap = new Map<string, Palette | null>();

  selectedStationSubject = new BehaviorSubject<{
    station: RadioBrowserStation;
    palette: Palette | null;
  } | null>(null);
  selectedStation$ = this.selectedStationSubject.asObservable();

  storageService = inject(StorageService);

  getThumbnailUrl(station: RadioBrowserStation): string {
    return station.favicon
      ? station.favicon
      : station.homepage + '/favicon.ico';
  }
  setSelectedStation(station: RadioBrowserStation) {
    this.storageService.addRecent(station);

    const cachedPalette = this.paletteMap.get(station.stationuuid);
    if (cachedPalette !== undefined) {
      this.updateSelectedStation(station, cachedPalette);
      return;
    }

    const imageUrl = this.getThumbnailUrl(station);
    this.fetchPaletteWithFallback(station, imageUrl);
  }

  private updateSelectedStation(
    station: RadioBrowserStation,
    palette: Palette | null
  ) {
    this.selectedStationSubject.next({ station, palette });
  }

  private fetchPaletteWithFallback(
    station: RadioBrowserStation,
    imageUrl: string
  ) {
    this.getPalette(imageUrl).subscribe({
      next: (result) => {
        this.paletteMap.set(station.stationuuid, result.palette);
        this.updateSelectedStation(station, result.palette);
      },
      error: () => {
        // Fallback: use Vibrant directly if proxy fails
        Vibrant.from(imageUrl)
          .getPalette()
          .then((palette) => {
            this.paletteMap.set(station.stationuuid, palette);
            this.updateSelectedStation(station, palette);
          })
          .catch(() => {
            this.paletteMap.set(station.stationuuid, null);
            this.updateSelectedStation(station, null);
          });
      },
    });
  }

  isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  http = inject(HttpClient);

  getPalette(imageUrl: string): Observable<{ palette: Palette }> {
    return this.http.get<{ palette: Palette }>(
      `http://localhost:3000/palette?url=${imageUrl}`
    );
  }

  constructor() {}

  setCountryCode(countryCode: string) {
    this.countryCodeSubject.next(countryCode);
  }

  setSearchTerm(newValue: string) {
    this.searchTermSubject.next(newValue);
  }

  onNextStation() {
    // const currentIndex = this.filteredStationsList.findIndex(
    //   (station) => station.stationuuid === this.selectedStation()?.stationuuid
    // );
    // const nextIndex = (currentIndex + 1) % this.filteredStationsList.length;
    // this.selectedStation.set(this.filteredStationsList[nextIndex]);
  }

  onPreviousStation() {
    // if (!this.selectedStation || this.filteredStationsList.length === 0) return;
    // const currentIndex = this.filteredStationsList.findIndex(
    //   (station) => station.stationuuid === this.selectedStation()?.stationuuid
    // );
    // const prevIndex =
    //   (currentIndex - 1 + this.filteredStationsList.length) %
    //   this.filteredStationsList.length;
    // this.selectedStation.set(this.filteredStationsList[prevIndex]);
  }

  onRandomStation() {
    // if (this.filteredStationsList.length === 0) return;
    // const randomIndex = Math.floor(
    //   Math.random() * this.filteredStationsList.length
    // );
    // this.selectedStation.set(this.filteredStationsList[randomIndex]);
  }

  clearImagePallete(id: string) {
    this.paletteMap.set(id, null);
  }
}
