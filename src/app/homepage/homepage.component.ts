import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SidebarService } from '../../services/sidebar.service';
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

  constructor() {}
}
