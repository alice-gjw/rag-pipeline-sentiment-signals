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
            <h1>Crypto Governance Sentiment Analyzer</h1>

            <textarea
                [(ngModel)]="eventDescription"
                placeholder = "Describe a governance event ..."
                rows = "4" >
            </textarea>

            <button (click)="analyze()" [disabled]="loading">
                <span *ngIf="loading" class="spinner"></span>    
                {{ loading ? 'Analyzing ...' : 'Analyze' }}
            </button>

            <div class="suggestions">                                              
                <p>Try an example:</p>                                             
                <button class="suggestion" (click)="eventDescription = 'Proposal to reduce staking rewards by 50%'">                                      
                    Reduce staking rewards                                         
                </button>                                                          
                <button class="suggestion" (click)="eventDescription = 'Proposal to increase treasury allocation for developer grants'">                  
                    Increase dev grants                                            
                </button>                                                          
                <button class="suggestion" (click)="eventDescription = 'Proposal to migrate liquidity to a new AMM protocol'">                            
                    Migrate liquidity                                              
                </button>                                                          
            </div>                                                                 


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
    .spinner {                                                  
                                                                
        display: inline-block;                                  
                                                                
        width: 14px;                                            
                                                                
        height: 14px;                                           
                                                                
        border: 2px solid #ccc;                                 
                                                                
        border-top-color: #333;                                 
                                                                
        border-radius: 50%;                                     
                                                                
        animation: spin 0.8s linear infinite;                   
                                                                
        margin-right: 6px;                                      
                                                                
    }                                                           
                                                                
    @keyframes spin {                                           
                                                                
        to { transform: rotate(360deg); }                       
                                                                
    }                                                           
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