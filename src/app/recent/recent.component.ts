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
import { RadioBrowserStation } from '../../services/radio-browser/radio-browser-api.model';
import { SidebarService } from '../../services/sidebar.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-recent',
  imports: [DialogModule, CommonModule],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.scss',
})
export class RecentComponent {
  @Input({ required: true }) recentVisible!: boolean;
  @Output() close = new EventEmitter<void>();

  storageService = inject(StorageService);
  sidebarService = inject(SidebarService);

  recent = this.storageService.recent;

  recentFilled = computed(() => {
    const recents = this.recent();
    // If recents has less than 20 elements, fill the rest with null
    const filled: (RadioBrowserStation | null)[] = [...recents];
    while (filled.length < 24) {
      filled.push(null);
    }
    return filled;
  });

  ngOnInit() {
    this.storageService.getRecent();
  }

  selectStation(station: RadioBrowserStation | null) {
    if (!station) return;
    this.sidebarService.setSelectedStation(station);
    this.close.emit();
  }
}
