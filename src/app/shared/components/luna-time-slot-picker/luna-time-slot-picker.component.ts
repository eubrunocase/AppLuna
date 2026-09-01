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

export interface LunaTimeSlotSelection {
  startTime: string;
  endTime: string;
  durationHours: number;
}

const DURATION_OPTIONS = [1, 2, 3, 4] as const;

@Component({
  selector: 'app-luna-time-slot-picker',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './luna-time-slot-picker.component.html',
  styleUrl: './luna-time-slot-picker.component.scss',
})
export class LunaTimeSlotPickerComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);

  readonly startTime = input('10:00');
  readonly durationHours = input(2);
  readonly slotChange = output<LunaTimeSlotSelection>();

  readonly wheels = viewChildren<ElementRef<HTMLElement>>('wheel');

  readonly selectedHour = signal(10);
  readonly selectedMinute = signal(0);
  readonly selectedDuration = signal(2);

  readonly durationOptions = DURATION_OPTIONS;

  readonly startTimeLabel = computed(() => {
    const hour = String(this.selectedHour()).padStart(2, '0');
    const minute = String(this.selectedMinute()).padStart(2, '0');
    return `${hour}:${minute}`;
  });

  readonly endTimeLabel = computed(() => this.addHours(this.startTimeLabel(), this.selectedDuration()));

  readonly slotSummary = computed(() => {
    const duration = this.selectedDuration();
    const durationLabel = duration === 1 ? '1 hora' : `${duration} horas`;
    return `${this.startTimeLabel()} – ${this.endTimeLabel()} · ${durationLabel}`;
  });

  readonly hourOptions = computed(() => Array.from({ length: 24 }, (_, index) => index));

  readonly minuteOptions = computed(() => [0, 15, 30, 45]);

  private readonly wheelItemHeight = 52;
  private scrollTimers = new Map<WheelKind, ReturnType<typeof setTimeout>>();
  private initialized = false;

  ngAfterViewInit(): void {
    this.applyInitialValues();

    queueMicrotask(() => {
      this.clampDuration();
      this.syncAllWheels(false);
      this.initialized = true;
      this.emitSlot();
    });

    this.destroyRef.onDestroy(() => {
      for (const timer of this.scrollTimers.values()) {
        clearTimeout(timer);
      }
    });
  }

  isDurationAvailable(hours: number): boolean {
    return this.toMinutes(this.startTimeLabel()) + hours * 60 < 24 * 60;
  }

  setDuration(hours: number): void {
    if (!this.isDurationAvailable(hours)) {
      return;
    }
    this.selectedDuration.set(hours);
    this.emitSlot();
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

        this.clampDuration();
        this.syncAllWheels(true);
        this.emitSlot();
      }, 80),
    );
  }

  private applyInitialValues(): void {
    const parsedStart = this.parseTime(this.startTime());
    if (parsedStart) {
      this.selectedHour.set(parsedStart.hour);
      this.selectedMinute.set(parsedStart.minute);
    }

    const duration = this.durationHours();
    this.selectedDuration.set(DURATION_OPTIONS.includes(duration as typeof DURATION_OPTIONS[number]) ? duration : 2);
  }

  private clampDuration(): void {
    const current = this.selectedDuration();
    if (this.isDurationAvailable(current)) {
      return;
    }

    const fallback = [...DURATION_OPTIONS].reverse().find(hours => this.isDurationAvailable(hours));
    if (fallback) {
      this.selectedDuration.set(fallback);
    }
  }

  private parseTime(value: string): { hour: number; minute: number } | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) {
      return null;
    }

    const normalizedMinute = [0, 15, 30, 45].reduce((closest, option) => {
      return Math.abs(option - minute) < Math.abs(closest - minute) ? option : closest;
    }, 0);

    return { hour, minute: normalizedMinute };
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

  private emitSlot(): void {
    this.slotChange.emit({
      startTime: this.startTimeLabel(),
      endTime: this.endTimeLabel(),
      durationHours: this.selectedDuration(),
    });
  }

  private addHours(time: string, hours: number): string {
    const totalMinutes = this.toMinutes(time) + hours * 60;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  }

  private toMinutes(time: string): number {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  }
}
