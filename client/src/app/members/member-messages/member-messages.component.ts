import { AfterViewChecked, Component, inject, input, viewChild } from '@angular/core';
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
export class MemberMessagesComponent implements AfterViewChecked {

  messageService = inject(MessageService);

  username = input.required<string>();
  messageForm = viewChild<NgForm>('messageForm');
  scrollContainer = viewChild<any>('scrollMe');

  messageContent = '';

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage() {
    this.messageService.sendMessage(this.username(), this.messageContent).then(() => {
      this.messageForm()?.reset();
      this.scrollToBottom();
    });
  }


  private scrollToBottom() {
    if (this.scrollContainer()) {
      this.scrollContainer().nativeElement.scrollTop = this.scrollContainer().nativeElement.scrollHeight;
    }
  }
}
