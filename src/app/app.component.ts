import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FavoritesComponent } from './favorites/favorites.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RecentComponent } from './recent/recent.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { WorldFilterComponent } from './world-filter/world-filter.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent,
    WorldFilterComponent,
    SidebarComponent,
    NavbarComponent,
    WorldFilterComponent,
    RecentComponent,
    FavoritesComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  worldMapVisible = false;
  recentVisible = false;
  favoritesVisible = false;

  showWorldMapDialog() {
    this.worldMapVisible = true;
  }

  constructor() {}
}
