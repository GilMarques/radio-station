import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';

import { RadioBrowserApi } from '../../services/radio-browser/radio-browser-api.model';
import { RadioBrowserApiService } from '../../services/radio-browser/radio-browser-api.service';
import { SidebarService } from '../../services/sidebar.service';
import { countryByContinent } from './world-list/country-by-continent';
import { WorldListComponent } from './world-list/world-list.component';
import { WorldMapComponent } from './world-map/world-map.component';

@Component({
  selector: 'app-world-filter',
  imports: [
    CommonModule,
    WorldMapComponent,
    WorldListComponent,
    TabsModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './world-filter.component.html',
  styleUrl: './world-filter.component.scss',
})
export class WorldFilterComponent {
  @Input({ required: true }) worldMapVisible!: boolean;

  selectedTab = 0;

  close = output<void>();

  countryList: RadioBrowserApi.Country[] = [];

  countriesByContinent = countryByContinent;

  onDialogHide() {
    this.selectedCountry.set(null);
    this.hoveredCountry.set(null);
    this.close.emit();
  }

  radioBrowserService = inject(RadioBrowserApiService);

  radioBrowserCountriesByContinent: Record<string, RadioBrowserApi.Country[]> =
    {};

  @ViewChild('worldMap') worldMap!: WorldMapComponent;

  sidebarService = inject(SidebarService);

  hoveredCountry = signal<RadioBrowserApi.Country | null>(null);
  selectedCountry = signal<RadioBrowserApi.Country | null>(null);

  onHoveredCountry(country: RadioBrowserApi.Country | null) {
    this.hoveredCountry.set(country);
  }

  onUnhoveredCountry() {
    this.hoveredCountry.set(null);
  }

  ngOnInit() {
    this.radioBrowserService.countries$.subscribe((countries) => {
      this.countryList = countries;
      this.getRadioBrowserCountriesByContinent();
    });
  }

  getRadioBrowserCountriesByContinent() {
    // Build a map from country code to continent name
    const codeToContinent = new Map(
      this.countriesByContinent['country'].map((c: any) => [
        c.countryCode,
        c.continentName,
      ])
    );

    // Group the countryList by continent
    this.radioBrowserCountriesByContinent = this.countryList.reduce(
      (acc: Record<string, RadioBrowserApi.Country[]>, country) => {
        const continent = codeToContinent.get(country.iso_3166_1);
        if (!continent) return acc;
        if (!acc[continent]) {
          acc[continent] = [];
        }
        acc[continent].push(country);
        return acc;
      },
      {}
    );
  }

  onSelectedCountry(country: RadioBrowserApi.Country) {
    this.selectedCountry.set(country);
  }

  onSelectCountry(country: RadioBrowserApi.Country) {
    this.sidebarService.setCountryCode(country.iso_3166_1);
    this.close.emit();
  }

  onSelectedStations(stations: RadioBrowserApi.Station[]) {
    this.sidebarService.setStations(
      this.selectedCountry()?.iso_3166_1 || null,
      stations
    );
    this.selectedCountry.set(null);
    this.hoveredCountry.set(null);
    this.close.emit();
  }
}
