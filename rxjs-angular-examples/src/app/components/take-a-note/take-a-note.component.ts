import { Component, OnInit } from '@angular/core';

import { of, merge, concat, defer, Observable, EMPTY } from 'rxjs';
import {
  delay,
  mergeMap,
  tap,
  debounceTime,
  distinctUntilChanged,
  mapTo,
  filter,
  share,
  switchAll,
} from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-take-a-note',
  templateUrl: './take-a-note.component.html',
  styleUrls: ['./take-a-note.component.scss'],
})
export class TakeANoteComponent implements OnInit {
  form: FormGroup = this.fb.group({
    note: [''],
  });
  savesInProgress: number;
  saveIndicator: string;
  inputToSave$: Observable<any>;
  savesInProgress$: Observable<Observable<string>>;
  savesCompleted$: Observable<Observable<string>>;

  constructor(private fb: FormBuilder) {}

  get controls() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.setInitialVariables();
    this.configureUserInput();
    this.whenSaveInProgress();
    this.whenSavesCompleted();
    this.setUpdateMethodForSaveIndicator();
  }

  setInitialVariables() {
    this.savesInProgress = 0;
    this.saveIndicator = 'All changes saved';
  }

  whenSavesCompleted() {
    this.savesInProgress$ = this.inputToSave$.pipe(
      mapTo(of('Saving')),
      tap((_) => this.savesInProgress++)
    );
  }

  whenSaveInProgress() {
    this.savesCompleted$ = this.inputToSave$.pipe(
      mergeMap(this.saveChanges),
      tap((_) => this.savesInProgress--),
      filter((_) => !this.savesInProgress),
      mapTo(
        concat(
          of('Saved!'),
          EMPTY.pipe(delay(2000)),
          defer(() => of(`Last updated: ${new Date().toLocaleString('pt-br').toString()}`))
        )
      )
    );
  }

  configureUserInput() {
    const noteValueChanges$ = this.controls.note.valueChanges;
    this.inputToSave$ = noteValueChanges$.pipe(
      debounceTime(200),
      filter(value => {
        debugger;
        return typeof(value) === 'string'
      }),
      distinctUntilChanged(),
      share()
    );
  }

  saveChanges(value: string) {
    return of(value).pipe(delay(1500));
  };

  setUpdateMethodForSaveIndicator() {
    merge(this.savesInProgress$, this.savesCompleted$)
      .pipe(
        switchAll()
      )
      .subscribe((status) => {
        this.saveIndicator = status;
      });
  }
}
