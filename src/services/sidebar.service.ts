import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  tap,
} from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { RadioBrowserApiService } from './radio-browser/radio-browser-api.service';
import { StorageService } from './storage.service';
import { Palette } from './vibrant.model';

import { Location } from '@angular/common';

import { Vibrant } from 'node-vibrant/browser';
import { RadioBrowserApi } from './radio-browser/radio-browser-api.model';

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

  private countryCodeSubject = new BehaviorSubject<string | null>(null);
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

  private stationsSubject = new BehaviorSubject<RadioBrowserApi.Station[]>([]);
  stations$ = this.stationsSubject.asObservable();

  private loadingStationsSubject = new BehaviorSubject<boolean>(true);
  loadingStations$ = this.loadingStationsSubject.asObservable();

  setLoadingStations(loading: boolean) {
    this.loadingStationsSubject.next(loading);
  }

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  setStations(countryCode: string | null, stations: RadioBrowserApi.Station[]) {
    this.stationsSubject.next(stations);
    this.countryCodeSubject.next(countryCode);
  }

  setFromId(id: string | null) {
    if (!id) {
      this.setLoadingStations(false);
      return;
    }
    this.setLoading(true);
    this.setLoadingStations(true);
    this.radioBrowserService.getStationById$(id).subscribe((station) => {
      this.setSelectedStation(station[0]);
      this.fetchStationsByCountryCode(station[0].countrycode);
    });
  }

  fetchStationsByCountryCode(countryCode: string) {
    this.radioBrowserService.getStationsByCountryCode$(countryCode).subscribe({
      next: (stations) => {
        this.setStations(countryCode, stations);
        this.setLoadingStations(false);
      },
      error: () => {
        this.setLoadingStations(false);
      },
    });
  }

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
    })
  );

  private normalizeString(str: string): string {
    return str
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
      .toLowerCase(); // Convert to lowercase
  }

  private sortStations(
    stations: RadioBrowserApi.Station[],
    sortOption: SortOption
  ): RadioBrowserApi.Station[] {
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

  filteredStationsList: RadioBrowserApi.Station[] = [];

  paletteMap = new Map<string, Palette | null>();

  selectedStationSubject = new BehaviorSubject<{
    station: RadioBrowserApi.Station;
    palette: Palette | null;
  } | null>(null);
  selectedStation$ = this.selectedStationSubject.asObservable();

  selectedStation?: RadioBrowserApi.Station;

  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  location = inject(Location);

  storageService = inject(StorageService);

  setSelectedStation(station: RadioBrowserApi.Station) {
    this.storageService.addRecent(station);
    this.selectedStation = station;

    const cachedPalette = this.paletteMap.get(station.stationuuid);
    if (cachedPalette !== undefined) {
      this.updateSelectedStation(station, cachedPalette);
      return;
    }

    const imageUrl = RadioBrowserApi.getThumbnailUrl(station);
    this.fetchPaletteWithFallback(station, imageUrl);
  }

  private updateSelectedStation(
    station: RadioBrowserApi.Station,
    palette: Palette | null
  ) {
    this.selectedStationSubject.next({ station, palette });
    this.location.go('/' + station.stationuuid);
  }

  private fetchPaletteWithFallback(
    station: RadioBrowserApi.Station,
    imageUrl: string
  ) {
    this.loadingSubject.next(true);
    this.getPalette(imageUrl).subscribe({
      next: (result) => {
        this.paletteMap.set(station.stationuuid, result.palette);
        this.updateSelectedStation(station, result.palette);
        this.loadingSubject.next(false);
      },
      error: () => {
        // Fallback: use Vibrant directly if proxy fails
        Vibrant.from(imageUrl)
          .getPalette()
          .then((palette) => {
            this.paletteMap.set(station.stationuuid, palette);
            this.updateSelectedStation(station, palette);
            this.loadingSubject.next(false);
          })
          .catch(() => {
            this.paletteMap.set(station.stationuuid, null);
            this.updateSelectedStation(station, null);
            this.loadingSubject.next(false);
          });
      },
    });
  }

  http = inject(HttpClient);
  paletteProxyUrl = 'https://radio-station-proxy.ew.r.appspot.com';

  getPalette(imageUrl: string): Observable<{ palette: Palette }> {
    return this.http.get<{ palette: Palette }>(
      `${this.paletteProxyUrl}/palette?url=${imageUrl}`
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
    const currentIndex = this.filteredStationsList.findIndex(
      (station) => station.stationuuid === this.selectedStation?.stationuuid
    );
    const nextIndex = (currentIndex + 1) % this.filteredStationsList.length;

    this.setSelectedStation(this.filteredStationsList[nextIndex]);
  }

  onPreviousStation() {
    if (!this.selectedStation || this.filteredStationsList.length === 0) return;
    const currentIndex = this.filteredStationsList.findIndex(
      (station) => station.stationuuid === this.selectedStation?.stationuuid
    );
    const prevIndex =
      (currentIndex - 1 + this.filteredStationsList.length) %
      this.filteredStationsList.length;
    this.setSelectedStation(this.filteredStationsList[prevIndex]);
  }

  onRandomStation() {
    if (this.filteredStationsList.length === 0) return;
    const randomIndex = Math.floor(
      Math.random() * this.filteredStationsList.length
    );

    this.setSelectedStation(this.filteredStationsList[randomIndex]);
  }

  clearImagePallete(id: string) {
    this.paletteMap.set(id, null);
  }
}
