import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionResponse {
    prediction: number;
    confidence: number;
    reasoning: string;
    sources: Array<{
        proposal: string;
        outcome: string;
        price_at_start: number;
        price_at_end: number;
        url: string;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class PredictionService {
    private apiUrl = 'http://localhost:8000';

    constructor(private http: HttpClient) { }

    predict(description: string): Observable<PredictionResponse> {
        return this.http.post<PredictionResponse>(
            `${this.apiUrl}/predict`,
            { description }
        );
    }
}

