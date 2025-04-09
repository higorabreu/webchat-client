import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.css']
})
export class ConversationItemComponent {
  @Input() name!: string;
  @Input() username!: string;
  @Input() message!: string;
  @Input() unread!: boolean;
  @Output() itemClicked = new EventEmitter<void>();
  
  onClick(): void {
    this.itemClicked.emit();
  }
}
