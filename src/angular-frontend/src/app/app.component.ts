import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PredictionService, PredictionResponse } from './services/prediction.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
        <div class="container">
            <h1>Crypto Governance Sentiment Analyzer</ h1 >

            <textarea
                [(ngModel)]="eventDescription"
                placeholder = "Describe a governance event ..."
                rows = "4" >
            </textarea>

            <button> (click]"analyze()" [disabled]="loading">
                {{ loading ? 'Analyzing ...' : 'Analyze' }}
            </button>

            <div *ngIf="result" class="results">
                <h2>Prediction: {{ (result.prediction * 100).toFixed(1)}}%</h2>
                <p>Confidence: {{ (result.confidence * 100).toFixed(0) }}%</p>
                <p>{{ result.reasoning }}</p>

                <h3>Sources</h3>
                <ul>
                    <li *ngFor="let source of result.sources">
                        <a [href]="source.url" target="_blank">{{ source.proposal }}</a>
                    </li>
                </ul>
            </div>
        </div>
    `,
    styles: [`                                                           
      .container { max-width: 600px; margin: 2rem auto; padding: 1rem; } 
      textarea { width: 100%; padding: 0.5rem; }                         
      button { margin-top: 1rem; padding: 0.5rem 1rem; }                 
      .results { margin-top: 2rem; }                                     
    `]                                                                   
})
export class AppComponent {
    eventDescription = '';
    result: PredictionResponse | null = null;
    loading = false;

    constructor(private predictionService: PredictionService) {}

    analyze() {
        this.loading = true;
        this.predictionService.predict(this.eventDescription).subscribe({
            next: (res) => {
                this.result = res;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }
}