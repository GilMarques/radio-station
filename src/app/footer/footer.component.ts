import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { RadioBrowserApiService } from '../../services/radio-browser/radio-browser-api.service';
import { StorageService } from '../../services/storage.service';
@Component({
  selector: 'app-footer',
  imports: [
    ButtonModule,
    SelectModule,
    FormsModule,
    CommonModule,
    TooltipModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  radioBrowserApiService = inject(RadioBrowserApiService);
  baseUrls$ = this.radioBrowserApiService.baseUrls$;

  selectedUrl: { name: string; ip: string; label: string } | null = null;

  selectedBaseUrl$ = this.radioBrowserApiService.selectedBaseUrl$;

  storageService = inject(StorageService);
  toggleDarkMode() {
    const element = document.querySelector('html');
    element!.classList.toggle('dark');
    this.storageService.toggleDarkMode();
  }

  ngOnInit() {
    this.selectedBaseUrl$.subscribe((url) => {
      if (!url) return;
      this.selectedUrl = {
        name: url.name,
        ip: url.ip,
        label: url.name.split('.')[0],
      };
    });
  }

  onBaseUrlChange(event: SelectChangeEvent) {
    const url = event.value as { name: string; ip: string };

    this.radioBrowserApiService.setSelectedBaseUrl({
      ip: url.ip,
      name: url.name,
    });
  }
}
