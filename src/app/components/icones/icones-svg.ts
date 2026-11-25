import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icone } from './icone.type';

@Component({
  selector: 'app-icones-svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icones-svg.html',
  styles: `
    :host {
      display: inline-flex;
      width: 1em;
      height: 1em;
      flex-shrink: 0;
      vertical-align: -0.125em;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconesSvg {
  public nome = input.required<Icone>();
}
