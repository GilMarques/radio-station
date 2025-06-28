import { Component, signal } from '@angular/core';
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

  items = [
    {
      label: 'Toggle',
      icon: 'fa fa-sun',
      command: () => this.toggleDarkMode(),
    },
  ];
}
