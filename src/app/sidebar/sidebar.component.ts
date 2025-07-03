import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { MenuModule } from 'primeng/menu';

import { RadioBrowserStation } from '../../services/radio-browser/radio-browser-api.model';

import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { RadioBrowserApiService } from '../../services/radio-browser/radio-browser-api.service';
import { SidebarService } from '../../services/sidebar.service';
import { EllipsisPipe } from '../../shared/ellipsis.pipe';
@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    MenuModule,
    InputGroupModule,
    InputGroupAddonModule,
    EllipsisPipe,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  sidebarService = inject(SidebarService);
  radioBrowserService = inject(RadioBrowserApiService);

  filteredStations$ = this.sidebarService.filteredStations$;

  searchTerm: string = '';

  @Output() showWorldMap: EventEmitter<void> = new EventEmitter();

  constructor() {}

  getThumbnailUrl(station: RadioBrowserStation): string {
    return station.favicon
      ? station.favicon
      : station.homepage + '/favicon.ico';
  }

  selectStation(station: RadioBrowserStation) {
    this.sidebarService.setSelectedStation(station);
  }

  onSearch(newValue: string) {
    this.sidebarService.setSearchTerm(newValue);
  }

  onGlobeClick() {
    this.showWorldMap.emit();
  }

  filters: {
    label: string;
    items: {
      index: number;
      label: string;
      icon: string;
      sort: 'asc' | 'desc' | null;
      key: 'name' | 'popularity' | 'trending';
    }[];
  }[] = [
    {
      label: 'Filter',
      items: [
        {
          index: 0,
          label: 'A-Z',
          icon: 'fas fa-fw fa-font',
          sort: null,
          key: 'name',
        },
        {
          index: 1,
          label: 'Popularity',
          icon: 'fas fa-fw fa-crown',
          sort: null,
          key: 'popularity',
        },
        {
          index: 2,
          label: 'Trending',
          icon: 'fas fa-fw fa-fire',
          sort: null,
          key: 'trending',
        },
      ],
    },
  ];

  get isSorting() {
    return this.filters[0].items.some((item) => item.sort !== null);
  }

  onFilterChange(event: MouseEvent, index: number, sort: string) {
    event.preventDefault();
    event.stopPropagation();

    this.filters[0].items = this.filters[0].items.map((item) => {
      return { ...item, sort: null };
    });
    let result: 'asc' | 'desc' = 'asc';
    if (!sort) {
      result = 'asc';
    } else if (sort === 'asc') {
      result = 'desc';
    } else if (sort === 'desc') {
      result = 'asc';
    }

    this.filters[0].items[index].sort = result;

    const key = this.filters[0].items[index].key as
      | 'name'
      | 'popularity'
      | 'trending';

    this.sidebarService.setSortOption(key, result);
  }

  clearFilters() {
    this.filters[0].items = this.filters[0].items.map((item) => {
      return { ...item, sort: null };
    });
    this.sidebarService.setSortOption('none');
  }
}
