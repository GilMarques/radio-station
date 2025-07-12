import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-footer',
  imports: [ButtonModule, SelectModule, FormsModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  // TODO: SELECT SERVER
  urls = [
    { name: 'FI1', code: 'AU' },
    { name: 'FI2', code: 'BR' },
    { name: 'DE1', code: 'CN' },
  ];

  selectedUrl: any;

  // TODO: Add station
  onAddStation() {}
}
