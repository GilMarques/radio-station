import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
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

  getCountries$(): Observable<RadioBrowserApi.Country[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        return this.getCountries(url.name);
      })
    );
  }

  getStates$(countryName: string): Observable<RadioBrowserApi.State[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        return this.getStates(url.name, countryName);
      })
    );
  }

  getLanguages$(): Observable<RadioBrowserApi.Language[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        return this.getLanguages(url.name);
      })
    );
  }

  getTags$(): Observable<RadioBrowserApi.Tag[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        return this.getTags(url.name);
      })
    );
  }

  getStationsByCountryCode$(
    countryCode: string
  ): Observable<RadioBrowserApi.Station[]> {
    countryCode = countryCode.toLowerCase();

    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        return this.getStationsList(url.name, countryCode);
      })
    );
  }

  getStationById$(id: string): Observable<RadioBrowserApi.Station[]> {
    return this.selectedBaseUrl$.pipe(
      switchMap((url) => {
        return this.getStationById(url.name, id);
      })
    );
  }

  private getBaseUrls(): Observable<RadioBrowserApi.BaseUrl[]> {
    return this.http.get<RadioBrowserApi.BaseUrl[]>(
      'https://all.api.radio-browser.info/json/servers'
    );
  }

  private getCountries(baseUrl: string): Observable<RadioBrowserApi.Country[]> {
    return this.http.get<RadioBrowserApi.Country[]>(
      `https://${baseUrl}/json/countries`
    );
  }

  private getStates(
    baseUrl: string,
    countryName: string
  ): Observable<RadioBrowserApi.State[]> {
    return this.http.get<RadioBrowserApi.State[]>(
      `https://${baseUrl}/json/states/${countryName}`
    );
  }

  private getLanguages(
    baseUrl: string
  ): Observable<RadioBrowserApi.Language[]> {
    return this.http.get<RadioBrowserApi.Language[]>(
      `https://${baseUrl}/json/languages`
    );
  }

  private getTags(baseUrl: string): Observable<RadioBrowserApi.Tag[]> {
    return this.http.get<RadioBrowserApi.Tag[]>(`https://${baseUrl}/json/tags`);
  }

  private getStationsList(
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

  private getStationById(
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

  private selectedBaseUrlSubject = new BehaviorSubject<RadioBrowserApi.BaseUrl>(
    {
      ip: '123.123.123.123',
      name: 'de2.api.radio-browser.info',
    }
  );
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
