import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input-box.component.html',
  styleUrls: ['./message-input-box.component.css']
})
export class MessageInputBoxComponent {
  message: string = '';

  @Output() messageSent = new EventEmitter<string>();

  sendMessage() {
    if (this.message.trim()) {
      console.log('Enviando mensagem:', this.message);
      this.messageSent.emit(this.message.trim());
      this.message = '';
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
