import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { RadioBrowserApi } from '../../services/radio-browser/radio-browser-api.model';
import { SidebarService } from '../../services/sidebar.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-favorites',
  imports: [DialogModule, CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  @Input({ required: true }) favoritesVisible!: boolean;
  @Output() close = new EventEmitter<void>();

  storageService = inject(StorageService);
  sidebarService = inject(SidebarService);

  favorites = this.storageService.favorites;

  ngOnInit() {
    this.storageService.getFavorites();
  }

  favoritesFilled = computed(() => {
    const favorites = this.favorites();
    // If recents has less than 20 elements, fill the rest with null
    const filled: (RadioBrowserApi.Station | null)[] = [...favorites];
    while (filled.length < 24) {
      filled.push(null);
    }
    return filled;
  });

  selectStation(station: RadioBrowserApi.Station | null) {
    if (!station) return;
    this.sidebarService.setSelectedStation(station);
    this.close.emit();
  }
}
