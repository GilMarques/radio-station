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
import { RadioBrowserApi } from './radio-browser-api.model';

// https://api.radio-browser.info/

// TODO: Add descriptive User Agent header

@Injectable({
  providedIn: 'root',
})
export class RadioBrowserApiService {
  constructor(private http: HttpClient) {
    this.fetchBaseUrls();
  }

  getBaseUrls(): Observable<RadioBrowserApi.BaseUrl[]> {
    return of([{ ip: '1', name: 'asdf' }]);
    return this.http.get<RadioBrowserApi.BaseUrl[]>(
      'https://all.api.radio-browser.info/json/servers'
    );
  }

  getCountries(baseUrl: string): Observable<RadioBrowserApi.Country[]> {
    return this.http.get<RadioBrowserApi.Country[]>(
      `https://de2.api.radio-browser.info/json/countries`
    );
  }

  getStates(
    baseUrl: string,
    countryName: string
  ): Observable<RadioBrowserApi.State[]> {
    return this.http.get<RadioBrowserApi.State[]>(
      `https://de2.api.radio-browser.info/json/states/${countryName}`
    );
  }

  getLanguages(baseUrl: string): Observable<RadioBrowserApi.Language[]> {
    return this.http.get<RadioBrowserApi.Language[]>(
      `https://de2.api.radio-browser.info/json/languages`
    );
  }

  getTags(baseUrl: string): Observable<RadioBrowserApi.Tag[]> {
    return this.http.get<RadioBrowserApi.Tag[]>(
      `https://de2.api.radio-browser.info/json/tags`
    );
  }

  getStationsList(
    baseUrl: string,
    countryCode: string
  ): Observable<RadioBrowserApi.Station[]> {
    return this.http
      .get<RadioBrowserApi.Station[]>(
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

  getStationById(id: string): Observable<RadioBrowserApi.Station[]> {
    return this.http.get<RadioBrowserApi.Station[]>(
      `https://de2.api.radio-browser.info/json/stations/byuuid/${id}`
    );
  }

  private baseUrlsSubject = new BehaviorSubject<
    RadioBrowserApi.BaseUrl[] | null
  >(null);
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
  ): Observable<RadioBrowserApi.Station[]> {
    countryCode = countryCode.toLowerCase();

    return this.baseUrls$.pipe(
      switchMap((urls) => {
        if (!urls || urls.length === 0) {
          return throwError(() => new Error('No base URLs found'));
        }
        return this.getStationsList(urls[this.selectIndex].name, countryCode);
      })
    );
  }

  getStationById$(id: string): Observable<RadioBrowserApi.Station[]> {
    return this.baseUrls$.pipe(
      switchMap((urls) => {
        return this.getStationById(id);
      })
    );
  }

  get countries$(): Observable<RadioBrowserApi.Country[]> {
    return this.baseUrls$.pipe(
      switchMap((urls) => {
        if (!urls || urls.length === 0) {
          return throwError(() => new Error('No base URLs found'));
        }
        return this.getCountries(urls[this.selectIndex].name);
      })
    );
  }

  setSelectedIndex(index: number) {
    this.selectIndex = index;
  }

  addStation(station: RadioBrowserApi.AddStationOptions) {
    return this.http.post<RadioBrowserApi.Station>(
      `https://de2.api.radio-browser.info/json/add`,
      station
    );
  }
}
