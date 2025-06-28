import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  set(key: string, value: any): void {
    localStorage.setItem(key, value.toString());
  }

  get(key: string): any {
    const val = localStorage.getItem(key);
    return val;
  }

  clear(key: string): void {
    localStorage.removeItem(key);
  }
  constructor() {}
}
