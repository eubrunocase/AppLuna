import { Component, input } from '@angular/core';

@Component({
  selector: 'app-home-header-expand',
  standalone: true,
  template: `
    <div class="home-expand">
      <p class="home-expand__greeting">{{ greeting() }}</p>
      <div class="home-expand__meta">
        @if (userApartment()) {
          <span class="home-expand__unit">{{ userApartment() }}</span>
        }
        <span class="home-expand__role">{{ userRoleLabel() }}</span>
      </div>
    </div>
  `,
  styles: `
    .home-expand {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .home-expand__greeting {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #f9f6ee;
      letter-spacing: -0.02em;
    }

    @media (min-width: 1024px) {
      .home-expand__greeting {
        font-size: 1.65rem;
      }
    }
    .home-expand__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    .home-expand__unit,
    .home-expand__role {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.18);
      color: #f9f6ee;
    }
  `,
})
export class HomeHeaderExpandComponent {
  readonly greeting = input('');
  readonly userApartment = input('');
  readonly userRoleLabel = input('');
}
