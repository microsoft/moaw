import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading; else content" class="loader-container">
      <div class="loader"></div>
    </div>
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
  styles: [`
    .loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loader {
      width: 48px;
      height: 48px;
      border: 2px solid var(--text);
      border-radius: 50%;
      display: inline-block;
      position: relative;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }

    .loader::after {
      content: '';  
      box-sizing: border-box;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid transparent;
      border-bottom-color: var(--primary);
    }
        
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    } 
  `]
})
export class LoaderComponent {
  @Input() loading: boolean = false;
}
