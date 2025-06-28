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
import {
  RadioBrowserCountry,
  RadioBrowserStation,
} from '../../services/radio-browser/radio-browser-api.model';
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

  countryList: RadioBrowserCountry[] = [];

  countriesByContinent = countryByContinent;

  onDialogHide() {
    this.selectedCountry.set(null);
    this.hoveredCountry.set(null);
    this.close.emit();
  }

  radioBrowserService = inject(RadioBrowserApiService);

  radioBrowserCountriesByContinent: Record<string, RadioBrowserCountry[]> = {};

  @ViewChild('worldMap') worldMap!: WorldMapComponent;

  sidebarService = inject(SidebarService);

  hoveredCountry = signal<RadioBrowserCountry | null>(null);
  selectedCountry = signal<RadioBrowserCountry | null>(null);

  onHoveredCountry(country: RadioBrowserCountry | null) {
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
      (acc: Record<string, RadioBrowserCountry[]>, country) => {
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

  onSelectedCountry(country: RadioBrowserCountry) {
    this.selectedCountry.set(country);
  }

  onSelectCountry(country: RadioBrowserCountry) {
    this.sidebarService.setCountryCode(country.iso_3166_1);
    this.close.emit();
  }

  onSelectedStations(stations: RadioBrowserStation[]) {
    this.sidebarService.setOverrideStations(stations);
    this.selectedCountry.set(null);
    this.hoveredCountry.set(null);
    this.close.emit();
  }
}
