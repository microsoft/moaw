import { Component, ElementRef, Input, OnInit } from '@angular/core';
import * as octicons from '@primer/octicons';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: ``,
  styles: [
    `
      :host {
        display: inline-block;
        vertical-align: text-top;
        height: 1em;
      }
    `
  ]
})
export class IconComponent implements OnInit {
  @Input() name!: string;
  @Input() size: string = '16';

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    const icon = octicons[this.name as octicons.IconName];
    if (!icon) {
      console.error(`Unknown octicon: ${this.name}`);
      return;
    }
    const svg = icon.toSVG(this.size ? { width: Number(this.size) } : {});
    this.element.nativeElement.innerHTML = svg;
  }
}
