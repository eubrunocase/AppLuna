import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-luna-item-list',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './luna-item-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'luna-item-list',
    '[attr.role]': 'role()',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class LunaItemListComponent {
  readonly role = input('list');
  readonly ariaLabel = input('');
}
