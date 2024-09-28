import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  concatMap,
  defer,
  delay,
  filter,
  from,
  map,
  Observable,
  of,
  repeat,
  scan,
  skipUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'frontend';

  constructor(private readonly httpClient: HttpClient) {}

  async downloadCSV() {
    // this.downloadFile();
    this.streamFetch();
  }

  async streamFetch() {
    const writeStream = new window.WritableStream();
    const writer = writeStream.getWriter();

    fromFetch('http://localhost:3000/download')
      .pipe(
        map((res) => {
          console.log('------------------------');
          console.log('res', res);
          console.log('------------------------');
          return (res.body as ReadableStream<Uint8Array>).getReader();
        }),
        concatMap((reader) => {
          return defer(() => reader.read()).pipe(
            takeWhile((chunk) => !chunk.done),
            map((chunk) => new TextDecoder().decode(chunk.value) + '\n'),
            delay(2000),
            repeat()
          );
        }),
        map((data) => {
          console.log('------------------------');
          console.log('data', data);
          console.log('------------------------');
        })
      )
      .subscribe({
        next: (value) => {
          console.log('------------------------');
          console.log('value', value);
          console.log('------------------------');
        },
        complete: () => {
          console.log('------------------------');
          console.log('COMPLETE!!!');
          console.log('------------------------');
        },
      });
  }

  downloadFile(): void {
    this.httpClient
      .get('http://localhost:3000/download', {
        responseType: 'text',
        reportProgress: true,
        observe: 'body',
      })
      .subscribe({
        next: (chunk) => this.appendToCsv(chunk),
        error: (err) => console.error('Error downloading data', err),
        complete: () => console.log('Download completed!'),
      });
  }
  appendToCsv(data: string) {
    const blob = new Blob([data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();
  }
}
