import {
  Component,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input-box.component.html',
  styleUrls: ['./message-input-box.component.css'],
})
export class MessageInputBoxComponent {
  @ViewChild('messageBox') messageBox!: ElementRef;
  message: string = '';
  timestamp: string = '';

  @Output() messageSent = new EventEmitter<{
    message: string;
    timestamp: string;
  }>();

  sendMessage() {
    if (this.message.trim()) {
      const now = new Date();
      this.timestamp = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      this.messageSent.emit({
        message: this.message.trim(),
        timestamp: this.timestamp,
      });
      this.message = '';
      this.resetHeight();
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  adjustHeight(event?: Event) {
    const textarea = this.messageBox.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  resetHeight() {
    const textarea = this.messageBox.nativeElement;
    textarea.style.height = 'auto';
  }
}
