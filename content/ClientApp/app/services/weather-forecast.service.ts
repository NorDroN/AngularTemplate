import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
 
import { WeatherForecast } from '../models/index';
 
@Injectable()
export class WeatherForecastService {

    get weatherForecastsUrl() { return this.baseUrl + 'api/SampleData/WeatherForecasts'; };

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }
 
    getAll(): Observable<WeatherForecast[]> {
        return this.http
            .get<WeatherForecast[]>(this.weatherForecastsUrl);
    }
 
}
