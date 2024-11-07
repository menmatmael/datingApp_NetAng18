import { Component, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MemberMessagesComponent } from "../member-messages/member-messages.component";
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';
import { switchMap } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [TabsModule, GalleryModule, TimeagoModule, DatePipe, MemberMessagesComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  member: Member = {} as Member;
  images: GalleryItem[] = [];

  memberTabs = viewChild<TabsetComponent>('memberTabs');
  activeTab?: TabDirective;
  messages: Message[] = [];

  ngOnInit(): void {
    this.activatedRoute.data
      .pipe(
        switchMap(data => {
          this.member = data['member'];
          this.member && this.member?.photos?.map(photo => {
            const imageItem = new ImageItem({ src: photo.url, thumb: photo.url });
            this.images.push(imageItem);
          });
          return this.activatedRoute.queryParams;
        })
      )
      .subscribe(params => params['tab'] && this.selectTab(params['tab']));
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0 && this.member){
      this.messageService.getMessageThread(this.member.username).subscribe(m => this.messages = m);
    }
  }

  selectTab(heading: string) {
    if (this.memberTabs()) {
      const messageTab = this.memberTabs()?.tabs.find(t => t.heading === heading);
      if (messageTab) messageTab.active = true;
    }
  }

  onUpdateMessage(message: Message) {
    this.messages.push(message);
  }

}
