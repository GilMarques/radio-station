import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'form-autocomplete',
  imports: [
    InputGroupModule,
    InputGroupAddonModule,
    AutoCompleteModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    CommonModule,
  ],
  templateUrl: './form-autocomplete.component.html',
  styleUrl: './form-autocomplete.component.scss',
})
export class FormAutocompleteComponent {
  @Input({ required: true }) control!: FormControl;

  @Input() name?: string;
  @Input() placeholder?: string;
  @Input() icon?: string;
  @Input() help?: string;

  @Input() suggestions: any[] = [];
  @Input() optionLabel?: string;
  @Input() group?: boolean;
  @Input() multiple?: boolean;
  @Input() virtualScroll?: boolean;
  @Input() virtualScrollItemSize?: number;
  @Input() showClear?: boolean;

  @Output() onSelect = new EventEmitter<AutoCompleteSelectEvent>();
  @Output() completeMethod = new EventEmitter<AutoCompleteCompleteEvent>();

  @ContentChild('item', { read: TemplateRef })
  itemTemplate?: TemplateRef<any>;

  isInvalid() {
    return this.control.invalid && this.control.touched;
  }
}
