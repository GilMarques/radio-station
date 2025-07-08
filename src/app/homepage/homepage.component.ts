import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { RadioBrowserApi } from '../../services/radio-browser/radio-browser-api.model';
import { SidebarService } from '../../services/sidebar.service';
import { Palette } from '../../services/vibrant.model';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { AudioVisualizerComponent } from '../audio-visualizer/audio-visualizer.component';

@Component({
  selector: 'app-homepage',
  imports: [
    CommonModule,
    AudioVisualizerComponent,
    LoaderComponent,
    ButtonModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  sidebarService = inject(SidebarService);
  selectedStation$ = this.sidebarService.selectedStation$;
  loading$ = this.sidebarService.loading$;

  route = inject(ActivatedRoute);

  selectedStation: {
    station: RadioBrowserApi.Station | null;
    palette: Palette | null;
  } | null = null;

  constructor() {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.sidebarService.setFromId(params.get('id') ?? '');
    });
  }
}
