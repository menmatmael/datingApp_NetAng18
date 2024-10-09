import { Component, inject, OnInit } from '@angular/core';
import { RegisterComponent } from "../register/register.component";
// import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RegisterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // private httpClient = inject(HttpClient);

  url = 'https://localhost:5001/api/users';

  registerMode = false;
  // users: any;

  ngOnInit(): void {
    // this.getUsers();
  }

  registerToggle() {
    this.registerMode = !this.registerMode;
  }

  cancelRegister($event: boolean) {
    this.registerMode = $event;
  }

  // getUsers() {
  //   this.httpClient.get(this.url).subscribe({
  //     next: (response) => this.users = response,
  //     error: err => console.error(err),
  //     complete: () => console.log('Request has completed'),
  //   });
  // }
}
