import {
  Component,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmInputImports } from '@spartan-ng/helm/input';

export interface SearchableComboboxOption {
  value: string;
  label: string;
  keywords?: string;
}

@Component({
  selector: 'app-searchable-combobox',
  standalone: true,
  imports: [NgIcon, HlmInputImports],
  templateUrl: './searchable-combobox.component.html',
  styleUrl: './searchable-combobox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableComboboxComponent),
      multi: true,
    },
    provideIcons({
      lucideChevronDown,
      lucideSearch,
      lucideX,
    }),
  ],
})
export class SearchableComboboxComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  options = input.required<SearchableComboboxOption[]>();
  inputId = input('');
  placeholder = input('Buscar...');
  invalid = input(false);
  emptyMessage = input('Nenhum resultado encontrado');

  readonly searchText = signal('');
  readonly isOpen = signal(false);
  readonly highlightedIndex = signal(-1);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private selectedValue: string | null = null;
  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private disabled = false;
  private blurTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const options = this.options();
      if (!this.selectedValue) return;
      const selected = options.find(option => option.value === this.selectedValue);
      if (selected) {
        this.searchText.set(selected.label);
      }
    });
  }

  get filteredOptions(): SearchableComboboxOption[] {
    const query = this.normalize(this.searchText());
    if (!query) {
      return this.options();
    }

    return this.options().filter(option => {
      const haystack = this.normalize(`${option.label} ${option.keywords ?? ''}`);
      return haystack.includes(query);
    });
  }

  writeValue(value: string | null): void {
    this.selectedValue = value ? value : null;
    const selected = this.options().find(option => option.value === this.selectedValue);
    this.searchText.set(selected?.label ?? '');
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(value: string): void {
    this.searchText.set(value);
    this.isOpen.set(true);
    this.highlightedIndex.set(0);

    const exactMatch = this.options().find(
      option => this.normalize(option.label) === this.normalize(value)
    );

    if (exactMatch && exactMatch.value === this.selectedValue) {
      return;
    }

    this.selectedValue = null;
    this.onChange(null);
  }

  openDropdown(): void {
    if (this.disabled) return;
    this.clearBlurTimeout();
    this.isOpen.set(true);
    if (this.highlightedIndex() < 0 && this.filteredOptions.length > 0) {
      this.highlightedIndex.set(0);
    }
  }

  onBlur(): void {
    this.blurTimeout = setTimeout(() => {
      if (!this.host.nativeElement.contains(document.activeElement)) {
        this.closeDropdown(true);
      }
    }, 120);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    const items = this.filteredOptions;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isOpen.set(true);
      if (!items.length) return;
      const next = Math.min(this.highlightedIndex() + 1, items.length - 1);
      this.highlightedIndex.set(next);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!items.length) return;
      const prev = Math.max(this.highlightedIndex() - 1, 0);
      this.highlightedIndex.set(prev);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const index = this.highlightedIndex();
      if (index >= 0 && items[index]) {
        this.selectOption(items[index]);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDropdown(true);
    }
  }

  selectOption(option: SearchableComboboxOption): void {
    this.clearBlurTimeout();
    this.selectedValue = option.value;
    this.searchText.set(option.label);
    this.onChange(option.value);
    this.onTouched();
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.searchInput()?.nativeElement.blur();
  }

  clearSelection(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.clearBlurTimeout();
    this.selectedValue = null;
    this.searchText.set('');
    this.onChange(null);
    this.onTouched();
    this.isOpen.set(true);
    this.highlightedIndex.set(0);
    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
  }

  private closeDropdown(restoreSelection: boolean): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.onTouched();

    if (!restoreSelection) return;

    const selected = this.options().find(option => option.value === this.selectedValue);
    this.searchText.set(selected?.label ?? '');
  }

  private clearBlurTimeout(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
