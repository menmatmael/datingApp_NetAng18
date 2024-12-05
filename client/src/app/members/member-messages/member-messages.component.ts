import { Component, inject, input, viewChild } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { TimeagoModule } from 'ngx-timeago';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [TimeagoModule, FormsModule],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css'
})
export class MemberMessagesComponent {
  messageService = inject(MessageService);

  username = input.required<string>();

  messageContent = '';
  messageForm = viewChild<NgForm>('messageForm');

  sendMessage() {
    this.messageService.sendMessage(this.username(), this.messageContent)
      .then(() => this.messageForm()?.reset());
  }

}
