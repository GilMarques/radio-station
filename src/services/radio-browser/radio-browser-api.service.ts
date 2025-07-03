import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import {
  RadioBrowserBase,
  RadioBrowserCountry,
  RadioBrowserStation,
} from './radio-browser-api.model';

// https://api.radio-browser.info/

// TODO: Add descriptive User Agent header

@Injectable({
  providedIn: 'root',
})
export class RadioBrowserApiService {
  constructor(private http: HttpClient) {
    this.fetchBaseUrls();
  }

  getBaseUrls(): Observable<RadioBrowserBase[]> {
    return of([{ ip: '1', name: 'asdf' }]);
    return this.http.get<RadioBrowserBase[]>(
      'https://all.api.radio-browser.info/json/servers'
    );
  }

  getServerCountries(baseUrl: string): Observable<RadioBrowserCountry[]> {
    return this.http.get<RadioBrowserCountry[]>(
      `https://de2.api.radio-browser.info/json/countries`
    );
  }

  getStationsList(
    baseUrl: string,
    countryCode: string
  ): Observable<RadioBrowserStation[]> {
    return this.http
      .get<RadioBrowserStation[]>(
        `https://de2.api.radio-browser.info/json/stations/bycountrycodeexact/${countryCode}?order=clickcount&reverse=true`
      )
      .pipe(
        map((stations) => {
          return stations.filter(
            (station) =>
              station.codec === 'MP3' ||
              station.codec === 'WAV' ||
              station.codec === 'OOG'
          );
        }),
        map((stations) => stations.filter((station) => station.favicon))
      );
  }

  private baseUrlsSubject = new BehaviorSubject<RadioBrowserBase[] | null>(
    null
  );
  baseUrls$ = this.baseUrlsSubject.asObservable();

  selectIndex = 0;

  private fetchBaseUrls() {
    this.getBaseUrls().subscribe({
      next: (urls) => this.baseUrlsSubject.next(urls),
      error: (err) => console.error('Failed to load base URLs', err),
    });
  }

  getStationsByCountryCode$(
    countryCode: string
  ): Observable<RadioBrowserStation[]> {
    return this.baseUrls$.pipe(
      switchMap((urls) => {
        if (!urls || urls.length === 0) {
          return throwError(() => new Error('No base URLs found'));
        }
        return this.getStationsList(urls[this.selectIndex].name, countryCode);
      })
    );
  }

  get countries$(): Observable<RadioBrowserCountry[]> {
    return this.baseUrls$.pipe(
      switchMap((urls) => {
        if (!urls || urls.length === 0) {
          return throwError(() => new Error('No base URLs found'));
        }
        return this.getServerCountries(urls[this.selectIndex].name);
      })
    );
  }

  setSelectedIndex(index: number) {
    this.selectIndex = index;
  }
}
