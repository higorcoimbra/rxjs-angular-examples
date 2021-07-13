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
    this.whenSaveCompleted();
    this.whenSavesInProgress();
    this.setUpdateMethodForSaveIndicator();
  }
  
  setInitialVariables() {
    this.savesInProgress = 0;
    this.saveIndicator = 'All changes saved';
  }

  configureUserInput() {
    const noteValueChanges$ = this.controls.note.valueChanges;
    this.inputToSave$ = noteValueChanges$.pipe(
      debounceTime(200),
      filter(value => typeof(value) === 'string'),
      distinctUntilChanged(),
      // hot stream: um produtor para vários consumidores
      share()
    );
  }

  whenSaveCompleted() {
    // mapeia qualquer entrada de usuário para a mensagem 'Saved!' e depois 'Last updated:...'
    this.savesCompleted$ = this.inputToSave$.pipe(
      /*
        * mapeia cada entrada de usuário para o Observable da "chamada de API"
        * "achata" (flattens) todos os Observables gerados com o mergeAll
        * emite o resultado do mergeAll 
      */
      mergeMap(this.saveChanges),
      tap((_) => this.savesInProgress--),
      // ignora se ainda tiver salvamentos em progresso
      filter((_) => !this.savesInProgress),
      mapTo(
        // emite cada observable abaixo e espera cada um completar para passar
        concat(
          of('Saved!'),
          // mostra a mensagem de "Saved!" por 2 segundos
          EMPTY.pipe(delay(2000)),
          // usa o defer para que o Last updated tenha o tempo correto, será fabricado NO INSTANTE DA INSCRIÇÃO
          // testar tirando o defer
          defer(() => of(`Last updated: ${new Date().toLocaleString('pt-br').toString()}`))
        )
      )
    );
  }

  whenSavesInProgress() {
    // mapeia qualquer entrada de usuário para a mensagem 'Saving'
    this.savesInProgress$ = this.inputToSave$.pipe(
      mapTo(of('Saving')),
      tap((_) => this.savesInProgress++)
    );
  }

  /**
   * Dispara um salvamento quando o usuário para de digitar por 200ms
   * Faz o broadcast da mensagem para os Observers que cuidam da mensagem de salvamento
  */

  // simula uma chamada de api com um deplay de 1.5s
  saveChanges(value: string) {
    return of(value).pipe(delay(1500));
  };

  setUpdateMethodForSaveIndicator() {
    // emite de forma concorrente os valores dos dois Observables
    merge(this.savesInProgress$, this.savesCompleted$)
      .pipe(
        /*
          Se um novo salvamento vier quando o Observable de completar está rodando, queremos trocar para o estado de atualização do texto.
        */
        switchAll()
      )
      .subscribe((status) => {
        this.saveIndicator = status;
      });
  }
}
