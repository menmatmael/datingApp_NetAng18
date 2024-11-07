import { Component, inject, input, OnInit, output, viewChild } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { Message } from '../../_models/message';
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
  private messageService = inject(MessageService);

  messages = input.required<Message[]>();
  username = input.required<string>();
  updateMessage = output<Message>();

  messageContent = '';
  messageForm = viewChild<NgForm>('messageForm');

  sendMessage() {
    this.messageService.sendMessage(this.username(), this.messageContent)
      .subscribe(message => {
        this.updateMessage.emit(message);
        this.messageForm()?.reset();
      })
  }

}
