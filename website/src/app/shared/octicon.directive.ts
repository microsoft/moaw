import { Directive, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import * as octicons from '@primer/octicons';

@Directive({
  selector: '[octicon]',
  standalone: true
})
export class OcticonDirective implements OnInit {
  @Input('octicon') icon!: string;
  @Input() size!: string;

  constructor(private element: ElementRef) { }

  ngOnInit(): void {
    const icon = octicons[this.icon as octicons.IconName];
    if (!icon) {
      console.error(`Unknown octicon: ${this.icon}`);
      return;
    }
    const svg = icon.toSVG({ width: Number(this.size) });
    this.element.nativeElement.innerHTML = svg;
  }
}
