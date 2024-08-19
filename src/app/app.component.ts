import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MessageInputBoxComponent } from './message-input-box/message-input-box.component';
import { MessageBoxComponent } from './message-box/message-box.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent, HeaderComponent, SidebarComponent, MessageInputBoxComponent, MessageBoxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'webchat-client';
}
