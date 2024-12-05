import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MemberMessagesComponent } from "../member-messages/member-messages.component";
import { MessageService } from '../../_services/message.service';
import { switchMap } from 'rxjs';
import { PresenceService } from '../../_services/presence.service';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [TabsModule, GalleryModule, TimeagoModule, DatePipe, MemberMessagesComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private accountService = inject(AccountService);
  presenceService = inject(PresenceService);

  member: Member = {} as Member;
  images: GalleryItem[] = [];

  memberTabs = viewChild<TabsetComponent>('memberTabs');
  activeTab?: TabDirective;

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.member = data['member'];
      this.member && this.member?.photos?.map(photo => {
        const imageItem = new ImageItem({ src: photo.url, thumb: photo.url });
        this.images.push(imageItem);
      });
    });

    this.activatedRoute.paramMap.subscribe(() => this.onRouteParamsChange());
    this.activatedRoute.queryParams.subscribe(params => params['tab'] && this.selectTab(params['tab']));
  }

  onRouteParamsChange() {
    const user = this.accountService.currentUser();
    if (!user) return;
    if (this.messageService.hubConnection?.state === HubConnectionState.Connected &&
      this.activeTab?.heading === 'Messages') {
      this.messageService.hubConnection.stop().then(() => {
        this.messageService.createHubConnection(user, this.member.username);
      });
    }
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: this.activeTab.heading },
      queryParamsHandling: 'merge'
    });

    if (this.activeTab.heading === 'Messages' && this.member) {
      const user = this.accountService.currentUser();
      if (!user) return;
      this.messageService.createHubConnection(user, this.member.username);
    } else {
      this.messageService.stopHubConnection();
    }
  }

  selectTab(heading: string) {
    if (this.memberTabs()) {
      const messageTab = this.memberTabs()?.tabs.find(t => t.heading === heading);
      if (messageTab) messageTab.active = true;
    }
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
}
