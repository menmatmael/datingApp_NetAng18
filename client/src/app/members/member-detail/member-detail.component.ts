import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/member';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [TabsModule, GalleryModule],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit {
  private membersService = inject(MembersService);
  private activatedRoute = inject(ActivatedRoute);

  member?: Member;
  images: GalleryItem[] = [];

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    const username = this.activatedRoute.snapshot.paramMap.get('username');
    if (!username) return;
    this.membersService.getMember(username)
      .subscribe(member => {
        this.member = member;
        // this.images = member?.photos?.map(photo => new ImageItem({ src: photo.url, thumb: photo.url }));
        member?.photos?.map(photo => {
          const imageItem = new ImageItem({ src: photo.url, thumb: photo.url });
          this.images.push(imageItem);
          this.images.push(imageItem);
          this.images.push(imageItem);
        });
      });
  }

}
