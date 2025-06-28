import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-favorites',
  imports: [DialogModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  favoritesVisible = false;
}
