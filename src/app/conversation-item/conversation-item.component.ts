import { CommonModule } from '@angular/common';
import { Component, Input, ElementRef, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.css']
})
export class ConversationItemComponent implements AfterViewInit {
  @Input() name!: string;
  @Input() username!: string;
  @Input() message!: string;
  @Input() unread!: boolean;

  constructor(private elRef: ElementRef) {}

  private checkWidth() {
    const itemElement = this.elRef.nativeElement.querySelector('#item');
    const messageElement = this.elRef.nativeElement.querySelector('#message');

    if (itemElement && messageElement) {
      if (itemElement.offsetWidth < 350) {
        messageElement.classList.add('hide-message');
      } else {
        messageElement.classList.remove('hide-message');
      }
    }
  }

  ngAfterViewInit() {
    this.checkWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkWidth();
  }
}
