import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'form-input',
  imports: [
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    CommonModule,
  ],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss',
})
export class FormInputComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() name?: string;
  @Input() icon?: string;
  @Input() help?: string;

  @Input() placeholder?: string;

  isInvalid() {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }
}
