import { CommonModule } from '@angular/common';
import { Component, Input, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'custom-slider',
  imports: [CommonModule, SliderModule, FormsModule],
  templateUrl: './custom-slider.component.html',
  styleUrl: './custom-slider.component.scss',
})
export class CustomSliderComponent {
  @Input({ required: true }) value!: number;

  primaryColor = input<string | undefined>('#000000');
  trackColor = input<string | undefined>('#ffffff');

  onChange = output<number>();
  onSlideEnd = output<number | undefined>();
}
