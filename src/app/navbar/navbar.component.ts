import { Component, EventEmitter, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, PopoverModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isDarkMode = signal(false);
  toggleDarkMode() {
    const element = document.querySelector('html');
    element!.classList.toggle('p-dark');
    this.isDarkMode.update((prev) => !prev);
  }

  @Output() showRecent = new EventEmitter<void>();
  @Output() showFavorites = new EventEmitter<void>();
  @Output() showMenu = new EventEmitter<void>();
  @Output() showContribute = new EventEmitter<void>();

  items = [
    {
      label: 'Toggle',
      icon: 'fa fa-sun',
      command: () => this.toggleDarkMode(),
    },
  ];
}
