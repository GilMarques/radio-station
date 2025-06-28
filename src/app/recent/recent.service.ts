import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CacheService } from '../../services/cache.service';
import { RadioBrowserStation } from '../../services/radio-browser/radio-browser-api.model';

@Injectable({
  providedIn: 'root',
})
export class RecentService {
  private recentSubject = new BehaviorSubject<RadioBrowserStation[]>([]);
  recent$ = this.recentSubject.asObservable();

  constructor(private cacheService: CacheService) {}

  addRecent(station: RadioBrowserStation) {
    const recent = this.cacheService.get('recent') ?? [];

    const cappedRecent = [station, ...recent].slice(-20);
    this.cacheService.set('recent', cappedRecent);
    this.recentSubject.next(cappedRecent);
  }
}
