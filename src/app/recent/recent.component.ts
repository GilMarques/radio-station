import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-recent',
  imports: [DialogModule],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.scss',
})
export class RecentComponent {
  recentVisible = false;
}
