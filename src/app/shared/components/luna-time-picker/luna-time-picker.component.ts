import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  inject,
  DestroyRef,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

type WheelKind = 'hour' | 'minute';

@Component({
  selector: 'app-luna-time-picker',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './luna-time-picker.component.html',
  styleUrl: './luna-time-picker.component.scss',
})
export class LunaTimePickerComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);

  readonly value = input<string | undefined>();
  readonly timeChange = output<string>();

  readonly wheels = viewChildren<ElementRef<HTMLElement>>('wheel');

  readonly selectedHour = signal(10);
  readonly selectedMinute = signal(0);

  readonly formattedTimeLabel = computed(() => {
    const hour = String(this.selectedHour()).padStart(2, '0');
    const minute = String(this.selectedMinute()).padStart(2, '0');
    return `${hour}:${minute}`;
  });

  readonly hourOptions = computed(() => Array.from({ length: 24 }, (_, index) => index));
  readonly minuteOptions = computed(() => [0, 15, 30, 45]);

  private readonly wheelItemHeight = 52;
  private scrollTimers = new Map<WheelKind, ReturnType<typeof setTimeout>>();
  private initialized = false;

  ngAfterViewInit(): void {
    this.applyInitialValue();

    queueMicrotask(() => {
      this.syncAllWheels(false);
      this.initialized = true;
      this.emitTime();
    });

    this.destroyRef.onDestroy(() => {
      for (const timer of this.scrollTimers.values()) {
        clearTimeout(timer);
      }
    });
  }

  onWheelScroll(kind: WheelKind, event: Event): void {
    if (!this.initialized) {
      return;
    }

    const element = event.target as HTMLElement;
    const existing = this.scrollTimers.get(kind);
    if (existing) {
      clearTimeout(existing);
    }

    this.scrollTimers.set(
      kind,
      setTimeout(() => {
        const options = this.optionsFor(kind);
        const index = Math.round(element.scrollTop / this.wheelItemHeight);
        const value = options[Math.min(Math.max(index, 0), options.length - 1)];
        if (value === undefined) {
          return;
        }

        if (kind === 'hour') {
          this.selectedHour.set(value);
        } else {
          this.selectedMinute.set(value);
        }

        this.syncAllWheels(true);
        this.emitTime();
      }, 80),
    );
  }

  private applyInitialValue(): void {
    const parsed = this.parseTime(this.value());
    if (parsed) {
      this.selectedHour.set(parsed.hour);
      this.selectedMinute.set(parsed.minute);
      return;
    }

    const now = new Date();
    this.selectedHour.set(now.getHours());
    this.selectedMinute.set(this.nearestMinute(now.getMinutes()));
  }

  private parseTime(value: string | undefined): { hour: number; minute: number } | null {
    if (!value) {
      return null;
    }

    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) {
      return null;
    }

    return { hour, minute: this.nearestMinute(minute) };
  }

  private nearestMinute(minute: number): number {
    return [0, 15, 30, 45].reduce((closest, option) => {
      return Math.abs(option - minute) < Math.abs(closest - minute) ? option : closest;
    }, 0);
  }

  private optionsFor(kind: WheelKind): number[] {
    return kind === 'hour' ? this.hourOptions() : this.minuteOptions();
  }

  private syncAllWheels(animated: boolean): void {
    this.scrollWheelTo('hour', this.hourOptions().indexOf(this.selectedHour()), animated);
    this.scrollWheelTo('minute', this.minuteOptions().indexOf(this.selectedMinute()), animated);
  }

  private scrollWheelTo(kind: WheelKind, index: number, animated: boolean): void {
    const wheelIndex = kind === 'hour' ? 0 : 1;
    const element = this.wheels()[wheelIndex]?.nativeElement;
    if (!element || index < 0) {
      return;
    }

    element.scrollTo({
      top: index * this.wheelItemHeight,
      behavior: animated ? 'smooth' : 'auto',
    });
  }

  private emitTime(): void {
    this.timeChange.emit(this.formattedTimeLabel());
  }
}
