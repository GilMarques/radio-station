import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { FavoritesComponent } from './favorites/favorites.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RecentComponent } from './recent/recent.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { WorldFilterComponent } from './world-filter/world-filter.component';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';
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
    DrawerModule,
    ButtonModule,
    NgTemplateOutlet,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  worldMapVisible = false;
  recentVisible = false;
  favoritesVisible = false;
  drawerVisible = false;

  showWorldMapDialog() {
    this.worldMapVisible = true;
  }

  breakpointSub!: Subscription;
  breakpointObserver = inject(BreakpointObserver);

  ngAfterViewInit(): void {
    this.breakpointSub = this.breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe((result) => {
        if (result.matches && this.drawerVisible) {
          this.drawerVisible = false;
        }
      });
  }

  constructor() {}
}
