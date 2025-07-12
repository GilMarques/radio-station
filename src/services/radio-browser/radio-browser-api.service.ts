import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap, throwError } from 'rxjs';
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
    return this.http.get<RadioBrowserApi.BaseUrl[]>(
      'https://all.api.radio-browser.info/json/servers'
    );
  }

  getCountries(baseUrl: string): Observable<RadioBrowserApi.Country[]> {
    return this.http.get<RadioBrowserApi.Country[]>(
      `https://${baseUrl}/json/countries`
    );
  }

  getCountries$(): Observable<RadioBrowserApi.Country[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        if (!url) {
          return throwError(() => new Error('No base URL found'));
        }
        return this.getCountries(url.name);
      })
    );
  }

  getStates$(countryName: string): Observable<RadioBrowserApi.State[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        if (!url) {
          return throwError(() => new Error('No base URL found'));
        }
        return this.getStates(url.name, countryName);
      })
    );
  }

  getLanguages$(): Observable<RadioBrowserApi.Language[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        if (!url) {
          return throwError(() => new Error('No base URL found'));
        }
        return this.getLanguages(url.name);
      })
    );
  }

  getTags$(): Observable<RadioBrowserApi.Tag[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        if (!url) {
          return throwError(() => new Error('No base URL found'));
        }
        return this.getTags(url.name);
      })
    );
  }

  getStates(
    baseUrl: string,
    countryName: string
  ): Observable<RadioBrowserApi.State[]> {
    return this.http.get<RadioBrowserApi.State[]>(
      `https://${baseUrl}/json/states/${countryName}`
    );
  }

  getLanguages(baseUrl: string): Observable<RadioBrowserApi.Language[]> {
    return this.http.get<RadioBrowserApi.Language[]>(
      `https://${baseUrl}/json/languages`
    );
  }

  getTags(baseUrl: string): Observable<RadioBrowserApi.Tag[]> {
    return this.http.get<RadioBrowserApi.Tag[]>(`https://${baseUrl}/json/tags`);
  }

  getStationsList(
    baseUrl: string,
    countryCode: string
  ): Observable<RadioBrowserApi.Station[]> {
    return this.http
      .get<RadioBrowserApi.Station[]>(
        `https://${baseUrl}/json/stations/bycountrycodeexact/${countryCode}?order=clickcount&reverse=true`
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

  getStationById(
    baseUrl: string,
    id: string
  ): Observable<RadioBrowserApi.Station[]> {
    return this.http.get<RadioBrowserApi.Station[]>(
      `https://${baseUrl}/json/stations/byuuid/${id}`
    );
  }

  private baseUrlsSubject = new BehaviorSubject<
    { ip: string; name: string; label: string }[] | null
  >(null);
  baseUrls$ = this.baseUrlsSubject.asObservable();

  selectedBaseUrlSubject = new BehaviorSubject<RadioBrowserApi.BaseUrl | null>({
    ip: '123.123.123.123',
    name: 'de2.api.radio-browser.info',
  });
  selectedBaseUrl$ = this.selectedBaseUrlSubject.asObservable();

  private fetchBaseUrls() {
    this.getBaseUrls().subscribe({
      next: (urls) => {
        this.baseUrlsSubject.next(
          urls.map((url) => ({
            ip: url.ip,
            name: url.name,
            label: url.name.split('.')[0],
          }))
        );
        this.setSelectedBaseUrl(urls[0]);
      },
      error: (err) => console.error('Failed to load base URLs', err),
    });
  }

  getStationsByCountryCode$(
    countryCode: string
  ): Observable<RadioBrowserApi.Station[]> {
    countryCode = countryCode.toLowerCase();

    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        if (!url) {
          return throwError(() => new Error('No base URL found'));
        }
        return this.getStationsList(url.name, countryCode);
      })
    );
  }

  getStationById$(id: string): Observable<RadioBrowserApi.Station[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        if (!url) {
          return throwError(() => new Error('No base URL found'));
        }
        return this.getStationById(url.name, id);
      })
    );
  }

  get countries$(): Observable<RadioBrowserApi.Country[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        if (!url) {
          return throwError(() => new Error('No base URLs found'));
        }
        return this.getCountries(url.name);
      })
    );
  }

  setSelectedBaseUrl(url: RadioBrowserApi.BaseUrl) {
    this.selectedBaseUrlSubject.next(url);
  }

  addStation(station: RadioBrowserApi.AddStationOptions) {
    return this.http.post<RadioBrowserApi.Station>(
      `https://de2.api.radio-browser.info/json/add`,
      station
    );
  }
}
