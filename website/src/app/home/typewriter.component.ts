import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typewriter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="writer">{{ text }}</span>
    <span class="cursor" [class.typing]="typing">&nbsp;</span>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .writer {
        color: var(--primary);
      }

      .cursor {
        display: inline-block;
        margin-left: var(--space-xs);
        border-left: 4px solid currentColor;
        animation: blink 1s infinite;

        &.typing {
          animation: none;
        }
      }

      @keyframes blink {
        0% {
          border-color: currentColor;
        }
        49% {
          border-color: currentColor;
        }
        50% {
          border-color: transparent;
        }
        99% {
          border-color: transparent;
        }
        100% {
          border-color: currentColor;
        }
      }
    `
  ]
})
export class TypewriterComponent {
  @Input() words: string[] = [];

  private typeDelayInMs = 50;
  private pauseDelayInMs = 1000;
  private timer: number | undefined = undefined;

  typing = true;
  erase = false;
  wordIndex = 0;
  charIndex = 0;
  text = '';

  ngOnInit() {
    this.setNewWord();
    this.type();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  type() {
    if (this.words.length === 0) return;

    if (this.erase) {
      if (this.charIndex > 0) {
        this.text = this.text.slice(0, -1);
        this.charIndex--;
        this.timer = window.setTimeout(this.type.bind(this), this.typeDelayInMs);
        this.typing = true;
      } else {
        this.setNewWord();
        this.timer = window.setTimeout(this.type.bind(this), this.pauseDelayInMs);
        this.typing = false;
      }
    } else {
      if (this.charIndex < this.words[this.wordIndex].length) {
        this.text += this.words[this.wordIndex][this.charIndex];
        this.charIndex++;
        this.timer = window.setTimeout(this.type.bind(this), this.typeDelayInMs);
        this.typing = true;
      } else {
        this.erase = true;
        this.timer = window.setTimeout(this.type.bind(this), this.pauseDelayInMs);
        this.typing = false;
      }
    }
  }

  setNewWord() {
    this.erase = false;
    this.charIndex = 0;
    this.text = '';

    const current = this.wordIndex;
    while (current === this.wordIndex) {
      this.wordIndex = Math.floor(Math.random() * this.words.length);
    }
  }
}
