import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private userSelectedSubject = new Subject<string>();

  userSelected$ = this.userSelectedSubject.asObservable();

  selectUser(username: string): void {
    this.userSelectedSubject.next(username);
  }
}