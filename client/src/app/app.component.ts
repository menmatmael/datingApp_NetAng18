import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  title = 'DatingApp';
  url = 'https://localhost:5001/api/users';

  users: any;

  ngOnInit(): void {
    const sub = this.httpClient.get(this.url).subscribe({
      next: (response) => this.users = response,
      error: err => console.error(err),
      complete: () => console.log('Request has completed'),
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }


}
