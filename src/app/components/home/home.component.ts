import { Component } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ChatComponent, HeaderComponent, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
