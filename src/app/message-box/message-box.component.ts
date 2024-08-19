import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.css'
})
export class MessageBoxComponent {
  @Input() message: string = '';
  @Input() isSent: boolean = false;
}
