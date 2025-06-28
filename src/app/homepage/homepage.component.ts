import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RadioBrowserStation } from '../../services/radio-browser/radio-browser-api.model';
import { SidebarService } from '../../services/sidebar.service';
import { Palette } from '../../services/vibrant.model';
import { AudioVisualizerComponent } from '../audio-visualizer/audio-visualizer.component';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, AudioVisualizerComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  sidebarService = inject(SidebarService);
  selectedStation$ = this.sidebarService.selectedStation$;

  selectedStation: RadioBrowserStation | null = null;
  selectedPalette: Palette | null = null;
  ngOnInit() {
    this.sidebarService.selectedStation$.subscribe((station) => {
      this.selectedStation = station?.station ?? null;
      this.selectedPalette = station?.palette ?? null;
    });
  }

  constructor() {}
}
