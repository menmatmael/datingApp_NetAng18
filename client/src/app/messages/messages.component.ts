import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TimeagoModule } from 'ngx-timeago';
import { Message } from '../_models/message';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [PaginationModule, FormsModule, ButtonsModule, TimeagoModule, RouterLink],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  messageService = inject(MessageService);
  container = "Inbox";
  pageNumber = 1;
  pageSize = 5;
  isOutbox = this.container === 'Outbox';

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container);
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id)
      .subscribe(() => {
        this.messageService.paginatedResult.update(prev => {
          const newItems = prev?.items?.filter(x => x.id !== id);
          return { ...prev, items: newItems};
        });
      });
  }

  getRoute(message: Message) {
    if (this.container === 'Outbox')
      return `/members/${message.recipientUsername}`;
    else
      return `/members/${message.senderUsername}`;
  }

  pageChanged(event: PageChangedEvent): void {
    if (this.pageNumber != event.page) {
      this.pageNumber = event.page;
      this.loadMessages();
    }
  }
}
