import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  output,
  signal,
  computed,
  viewChildren,
  inject,
  DestroyRef,
} from '@angular/core';

type WheelKind = 'day' | 'month' | 'year';

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  selector: 'app-luna-date-picker',
  standalone: true,
  templateUrl: './luna-date-picker.component.html',
  styleUrl: './luna-date-picker.component.scss',
})
export class LunaDatePickerComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);

  readonly minDate = input<Date>(this.startOfDay(new Date()));
  readonly maxDate = input<Date | undefined>(undefined);
  readonly date = input<Date | undefined>();
  readonly dateChange = output<Date>();

  readonly wheels = viewChildren<ElementRef<HTMLElement>>('wheel');

  readonly selectedDay = signal(1);
  readonly selectedMonth = signal(1);
  readonly selectedYear = signal(new Date().getFullYear());

  readonly formattedDateLabel = computed(() => {
    const date = new Date(this.selectedYear(), this.selectedMonth() - 1, this.selectedDay());
    const day = String(this.selectedDay()).padStart(2, '0');
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    return `${day} de ${month} de ${this.selectedYear()}`;
  });

  readonly yearOptions = computed(() => {
    const min = this.resolvedMin();
    const max = this.resolvedMax();
    const start = min.getFullYear();
    const end = max.getFullYear();
    return Array.from({ length: Math.max(end - start + 1, 1) }, (_, index) => start + index);
  });

  readonly monthOptions = computed(() => {
    const min = this.resolvedMin();
    const max = this.resolvedMax();
    const year = this.selectedYear();
    const startMonth = year === min.getFullYear() ? min.getMonth() + 1 : 1;
    const endMonth = year === max.getFullYear() ? max.getMonth() + 1 : 12;
    return Array.from({ length: Math.max(endMonth - startMonth + 1, 1) }, (_, index) => startMonth + index);
  });

  readonly dayOptions = computed(() => {
    const min = this.resolvedMin();
    const max = this.resolvedMax();
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const maxDay = this.daysInMonth(year, month);
    const startDay = year === min.getFullYear() && month === min.getMonth() + 1 ? min.getDate() : 1;
    const endDay = year === max.getFullYear() && month === max.getMonth() + 1 ? max.getDate() : maxDay;
    return Array.from({ length: Math.max(endDay - startDay + 1, 1) }, (_, index) => startDay + index);
  });

  private readonly wheelItemHeight = 52;
  private scrollTimers = new Map<WheelKind, ReturnType<typeof setTimeout>>();
  private initialized = false;

  ngAfterViewInit(): void {
    const min = this.minDate();
    const initial = this.date() ?? min;
    this.selectedDay.set(initial.getDate());
    this.selectedMonth.set(initial.getMonth() + 1);
    this.selectedYear.set(initial.getFullYear());
    this.clampToRange();

    queueMicrotask(() => {
      this.syncAllWheels(false);
      this.initialized = true;
      this.emitIfValid();
    });

    this.destroyRef.onDestroy(() => {
      for (const timer of this.scrollTimers.values()) {
        clearTimeout(timer);
      }
    });
  }

  monthName(month: number): string {
    return MONTHS_SHORT[month - 1] ?? String(month);
  }

  onWheelScroll(kind: WheelKind, event: Event): void {
    if (!this.initialized) return;

    const element = event.target as HTMLElement;
    const existing = this.scrollTimers.get(kind);
    if (existing) clearTimeout(existing);

    this.scrollTimers.set(
      kind,
      setTimeout(() => {
        const options = this.optionsFor(kind);
        const index = Math.round(element.scrollTop / this.wheelItemHeight);
        const value = options[Math.min(Math.max(index, 0), options.length - 1)];
        if (value === undefined) return;

        if (kind === 'day') this.selectedDay.set(value);
        if (kind === 'month') this.selectedMonth.set(value);
        if (kind === 'year') this.selectedYear.set(value);

        this.clampToRange();
        this.syncAllWheels(true);
        this.emitIfValid();
      }, 80),
    );
  }

  private optionsFor(kind: WheelKind): number[] {
    if (kind === 'day') return this.dayOptions();
    if (kind === 'month') return this.monthOptions();
    return this.yearOptions();
  }

  private clampToRange(): void {
    const min = this.resolvedMin();
    const max = this.resolvedMax();
    let day = this.selectedDay();
    let month = this.selectedMonth();
    let year = this.selectedYear();

    const maxDay = this.daysInMonth(year, month);
    if (day > maxDay) {
      day = maxDay;
    }

    let candidate = this.startOfDay(new Date(year, month - 1, day));
    if (candidate < min) {
      year = min.getFullYear();
      month = min.getMonth() + 1;
      day = min.getDate();
    } else if (candidate > max) {
      year = max.getFullYear();
      month = max.getMonth() + 1;
      day = max.getDate();
    }

    this.selectedYear.set(year);
    this.selectedMonth.set(month);
    this.selectedDay.set(day);
  }

  private syncAllWheels(animated: boolean): void {
    this.scrollWheelTo('day', this.dayOptions().indexOf(this.selectedDay()), animated);
    this.scrollWheelTo('month', this.monthOptions().indexOf(this.selectedMonth()), animated);
    this.scrollWheelTo('year', this.yearOptions().indexOf(this.selectedYear()), animated);
  }

  private scrollWheelTo(kind: WheelKind, index: number, animated: boolean): void {
    const wheelIndex = kind === 'day' ? 0 : kind === 'month' ? 1 : 2;
    const element = this.wheels()[wheelIndex]?.nativeElement;
    if (!element || index < 0) return;

    element.scrollTo({
      top: index * this.wheelItemHeight,
      behavior: animated ? 'smooth' : 'auto',
    });
  }

  private emitIfValid(): void {
    const date = this.startOfDay(
      new Date(this.selectedYear(), this.selectedMonth() - 1, this.selectedDay()),
    );
    if (date >= this.resolvedMin() && date <= this.resolvedMax()) {
      this.dateChange.emit(date);
    }
  }

  private resolvedMin(): Date {
    return this.startOfDay(this.minDate());
  }

  private resolvedMax(): Date {
    const max = this.maxDate();
    if (max) {
      return this.startOfDay(max);
    }

    const min = this.resolvedMin();
    return this.startOfDay(new Date(min.getFullYear() + 3, min.getMonth(), min.getDate()));
  }

  private daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  private startOfDay(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}
