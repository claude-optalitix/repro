import { Component, Input} from '@angular/core';

@Component({
    selector: 'tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss']
  })
  export class TooltipComponent {

    @Input()
    public text: string = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis exercitationem culpa 
    nesciunt nihil aut nostrum explicabo reprehenderit optio amet ab temporibus asperiores quasi cupiditate. 
    Voluptatum ducimus voluptates voluptas?`;

    @Input()
    public visible: boolean = true;
      
  }