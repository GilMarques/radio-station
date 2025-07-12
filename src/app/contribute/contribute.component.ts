import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { countriesByContinent } from '../world-filter/world-list/country-by-continent';

import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { BehaviorSubject, take } from 'rxjs';
import { RadioBrowserApi } from '../../services/radio-browser/radio-browser-api.model';
import { RadioBrowserApiService } from '../../services/radio-browser/radio-browser-api.service';
import { FormAutocompleteComponent } from '../../shared/form-autocomplete/form-autocomplete.component';
import { FormInputComponent } from '../../shared/form-input/form-input.component';

export function isValidUrl(control: AbstractControl): ValidationErrors | null {
  const url = control.value;
  if (
    (typeof url === 'string' &&
      (url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.length === 0)) ||
    url === null
  ) {
    return null;
  }
  return { invalidUrl: true };
}

@Component({
  selector: 'app-contribute',
  imports: [
    DialogModule,
    CommonModule,
    InputGroupModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputGroupAddonModule,
    ButtonModule,
    TooltipModule,
    AutoCompleteModule,
    MessageModule,
    ToastModule,
    FormInputComponent,
    FormAutocompleteComponent,
  ],
  providers: [MessageService],
  templateUrl: './contribute.component.html',
  styleUrl: './contribute.component.scss',
})
export class ContributeComponent {
  @Input({ required: true }) contributeVisible!: boolean;
  @Output() close = new EventEmitter<void>();

  form = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),
    url: new FormControl<string | null>(null, [
      Validators.required,
      isValidUrl,
    ]),
    homepage: new FormControl<string | null>(null, [
      Validators.required,
      isValidUrl,
    ]),
    favicon: new FormControl<string | null>(null, [isValidUrl]),
    country: new FormControl<{ name: string; code: string } | null>(null, [
      Validators.required,
    ]),
    state: new FormControl<{ name: string }[] | null>(null, []),
    languages: new FormControl<{ name: string }[] | null>(null, []),
    tags: new FormControl<{ name: string }[] | null>(null, []),
    latitude: new FormControl<number | null>(null, []),
    longitude: new FormControl<number | null>(null, []),
  });

  countriesSubject = new BehaviorSubject<RadioBrowserApi.Country[]>([]);
  countries$ = this.countriesSubject.asObservable();
  filteredCountries = new BehaviorSubject<
    {
      label: string;
      items: { name: string; code: string }[];
    }[]
  >([]);
  filteredCountries$ = this.filteredCountries.asObservable();

  statesSubject = new BehaviorSubject<RadioBrowserApi.State[]>([]);
  states$ = this.statesSubject.asObservable();
  filteredStates = new BehaviorSubject<{ label: string }[]>([]);
  filteredStates$ = this.filteredStates.asObservable();

  languagesSubject = new BehaviorSubject<RadioBrowserApi.Language[]>([]);
  languages$ = this.languagesSubject.asObservable();
  filteredLanguages = new BehaviorSubject<{ label: string }[]>([]);
  filteredLanguages$ = this.filteredLanguages.asObservable();

  tagsSubject = new BehaviorSubject<RadioBrowserApi.Tag[]>([]);
  tags$ = this.tagsSubject.asObservable();
  filteredTags = new BehaviorSubject<{ label: string }[]>([]);
  filteredTags$ = this.filteredTags.asObservable();

  radioBrowserApiService = inject(RadioBrowserApiService);

  ngOnInit() {
    //get countries
    this.radioBrowserApiService.getCountries('de2').subscribe((countries) => {
      this.countriesSubject.next(countries);
    });

    //get languages
    this.radioBrowserApiService.getLanguages('de2').subscribe((languages) => {
      this.languagesSubject.next(languages);
    });
    //get tags
    this.radioBrowserApiService.getTags('de2').subscribe((tags) => {
      this.tagsSubject.next(tags);
    });
  }

  fetchCountryStates(countryName: string) {
    this.radioBrowserApiService
      .getStates('de2', countryName)
      .subscribe((states) => {
        this.statesSubject.next(states);
      });
  }

  searchCountries(event: AutoCompleteCompleteEvent) {
    this.countries$.pipe(take(1)).subscribe((countries) => {
      // Filter from countriesByContinent all the countries that are not present in countries
      const countryCodes = new Set(countries.map((c) => c.iso_3166_1));
      const filteredCountriesByContinent = Object.fromEntries(
        Object.entries(countriesByContinent).map(
          ([continent, countriesList]) => [
            continent,
            countriesList.filter((country) =>
              countryCodes.has(country.countryCode)
            ),
          ]
        )
      );

      this.filteredCountries.next(
        Object.entries(filteredCountriesByContinent)
          .map(([continent, countries]) => {
            const filteredItems = countries
              .map((country) => ({
                name: country.countryName,
                code: country.countryCode,
              }))
              .filter(
                (country) =>
                  country.name
                    .toLowerCase()
                    .includes(event.query.toLowerCase()) ||
                  country.code.toLowerCase().includes(event.query.toLowerCase())
              );
            return {
              label: continent,
              items: filteredItems,
            };
          })
          .filter((continent) => continent.items.length > 0)
      );
    });
  }

  onCountrySelect(event: AutoCompleteSelectEvent) {
    this.form.get('state')?.setValue(null);
    this.statesSubject.next([]);
    this.fetchCountryStates(event.value.name);
  }

  searchStates(event: AutoCompleteCompleteEvent) {
    this.states$.pipe(take(1)).subscribe((states) => {
      this.filteredStates.next(
        states.map((state) => ({
          label: state.name,
          value: state.name,
        }))
      );
    });
  }

  searchLanguages(event: AutoCompleteCompleteEvent) {
    this.languages$.pipe(take(1)).subscribe((languages) => {
      const filteredLanguages = languages.filter((language) =>
        language.name.toLowerCase().includes(event.query.toLowerCase())
      );
      this.filteredLanguages.next(
        filteredLanguages.map((language) => ({
          label: language.name.charAt(0).toUpperCase() + language.name.slice(1),
        }))
      );
    });
  }

  searchTags(event: AutoCompleteCompleteEvent) {
    this.tags$.pipe(take(1)).subscribe((tags) => {
      const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(event.query.toLowerCase())
      );
      this.filteredTags.next(
        filteredTags.map((tag) => ({
          label: tag.name,
        }))
      );
    });
  }

  messageService = inject(MessageService);
  onSubmit() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail:
        'Because of a ways to break this service, it is not possible to add new stations at the moment.',
      life: 3000,
    });
  }

  onCancel() {
    this.form.reset();
    this.close.emit();
  }
}
