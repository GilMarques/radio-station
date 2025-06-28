import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { BehaviorSubject, map } from 'rxjs';
import { RadioBrowserCountry } from '../../../services/radio-browser/radio-browser-api.model';

@Component({
  selector: 'app-world-list',
  imports: [
    CommonModule,
    ListboxModule,

    InputTextModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './world-list.component.html',
  styleUrl: './world-list.component.scss',
})
export class WorldListComponent {
  countriesByContinent =
    input.required<Record<string, RadioBrowserCountry[]>>();

  searchTerm = '';

  searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  filteredCountries$ = this.searchTerm$.pipe(
    map((searchTerm) => {
      return Object.entries(this.countriesByContinent()).map(
        ([continent, countries]) => ({
          label: continent,
          items: countries.filter((country) =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        })
      );
    })
  );

  onSearch(event: string) {
    this.searchTermSubject.next(event);
  }

  selectedCountry = output<RadioBrowserCountry>();
  hoveredCountry = output<RadioBrowserCountry | null>();

  onCountrySelect(country: RadioBrowserCountry) {
    this.selectedCountry.emit(country);
  }

  onCountryMouseEnter(country: RadioBrowserCountry) {
    this.hoveredCountry.emit(country);
  }

  onCountryMouseLeave() {
    this.hoveredCountry.emit(null);
  }
}
