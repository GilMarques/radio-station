import { Component, inject } from '@angular/core';

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
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../services/sidebar.service';
import { ContributeComponent } from './contribute/contribute.component';
@Component({
  selector: 'app-root',
  imports: [
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
    RouterModule,
    ContributeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  worldMapVisible = false;
  recentVisible = false;
  favoritesVisible = false;
  drawerVisible = false;
  contributeVisible = false;

  showWorldMapDialog() {
    this.worldMapVisible = true;
  }

  breakpointSub!: Subscription;
  breakpointObserver = inject(BreakpointObserver);

  sidebarService = inject(SidebarService);

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
