import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { concatMap, defer, interval, map, Subject, takeUntil } from 'rxjs';
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
    const stop$: Subject<boolean> = new Subject();
    let content = '';

    fromFetch('http://localhost:3000/download')
      .pipe(
        map((res) => (res.body as ReadableStream<Uint8Array>).getReader()),
        concatMap((reader) => {
          return interval(1000).pipe(
            concatMap(() =>
              defer(() => reader.read()).pipe(
                map((chunk) => {
                  chunk.done && stop$.next(true);
                  return chunk.value;
                })
              )
            ),
            takeUntil(stop$)
          );
        })
      )
      .subscribe({
        next: (value) => {
          content += new TextDecoder().decode(value);
        },
        complete: async () => {
          this.appendToCsv(content);
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
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + data;
    a.setAttribute('download', 'data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
