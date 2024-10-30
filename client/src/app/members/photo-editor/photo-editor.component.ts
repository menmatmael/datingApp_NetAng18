import { AccountService } from './../../_services/account.service';
import { Component, inject, input, OnInit, output } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Member } from '../../_models/member';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';
import { environment } from '../../../environments/environment';
import { MembersService } from '../../_services/members.service';
import { Photo } from '../../_models/photo';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgStyle, FileUploadModule, DecimalPipe],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css'
})
export class PhotoEditorComponent implements OnInit {
  private accountService = inject(AccountService);
  private memberService = inject(MembersService);

  member = input.required<Member>();
  memberPhotosEdit = output<Member>();

  uploader?: FileUploader;
  hasBaseDropZoneOver = false;;
  response?: string;
  baseUrl = environment.apiUrl;

  ngOnInit(): void {
    this.initializeUploader();
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo)
      .subscribe(() => {
        const loggedInUser = this.accountService.currentUser();
        if (loggedInUser) {
          loggedInUser.photoUrl = photo.url;
          this.accountService.setCurrentUser(loggedInUser);
        }
        const updatedMember = {
          ...this.member(),
        };
        updatedMember.photoUrl = photo.url;
        updatedMember.photos.forEach(p => {
          if (p.isMain) p.isMain = false;
          if (p.id == photo.id) p.isMain = true;
        });
        this.memberPhotosEdit.emit(updatedMember);
      });
  }

  deletePhoto(photo: Photo) {
    this.memberService.deletePhoto(photo).subscribe(() => {
      const updatedMember = {
        ...this.member(),
      };
      updatedMember.photos = updatedMember.photos.filter(p => p.id !== photo.id);
      this.memberPhotosEdit.emit(updatedMember);
    });
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: `${this.baseUrl}users/add-photo`,
      authToken: `Bearer ${this.accountService.currentUser()?.token}`,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const photo = JSON.parse(response);
      const updatedMember = { ...this.member() };
      updatedMember.photos.push(photo);
      // this.memberPhotosEdit.emit(updatedMember);
      if (photo.isMain) {
        const loggedInUser = this.accountService.currentUser();
        if (loggedInUser) {
          loggedInUser.photoUrl = photo.url;
          this.accountService.setCurrentUser(loggedInUser);
        }
        updatedMember.photoUrl = photo.url;
        updatedMember.photos.forEach(p => {
          if (p.isMain) p.isMain = false;
          if (p.id == photo.id) p.isMain = true;
        });
        // this.memberPhotosEdit.emit(updatedMember);
      }
      this.memberPhotosEdit.emit(updatedMember);
    }
  }

}
