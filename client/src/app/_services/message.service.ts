import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginatedResult } from '../_models/PaginatedResult';
import { HttpClient } from '@angular/common/http';
import { Message } from '../_models/message';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { User } from '../_models/user';
import { Group } from '../_models/group';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubsUrl = environment.hubsUrl;

  private http = inject(HttpClient);
  hubConnection?: HubConnection;

  paginatedResult = signal<PaginatedResult<Message[]> | null>(null);
  messageThread = signal<Message[]>([]);

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubsUrl}message?user=${otherUsername}`, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(console.error);

    this.hubConnection.on("ReceiveMessageThread", messages => {
      this.messageThread.set(messages);
    });

    this.hubConnection.on("NewMessage", message => {
      this.messageThread.update(prevMessages => [...prevMessages, message]);
    });

    this.hubConnection.on("UpdatedGroup", (group: Group) => {
      if (group.connections.some(c => c.username === otherUsername)) {
        this.messageThread.update(messages => {
          messages.forEach(message => {
            if (!message.dateRead) {
              message.dateRead = new Date(Date.now())
            }
          })
          return messages;
        })
      }
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(console.error);
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = setPaginationHeaders(pageNumber, pageSize);

    params = params.append('Container', container);

    return this.http.get<Message[]>(`${this.baseUrl}messages`, { observe: 'response', params })
      .subscribe(response => {
        setPaginatedResponse(response, this.paginatedResult);
      });

  }

  getMessageThread(recipientUsername: string) {
    return this.http.get<Message[]>(`${this.baseUrl}messages/thread/${recipientUsername}`)
  }

  async sendMessage(recipientUsername: string, content: string) {
    return this.hubConnection?.invoke('SendMessage', { recipientUsername, content });
  }

  deleteMessage(id: number) {
    return this.http.delete(`${this.baseUrl}messages/${id}`);
  }
}
