import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { AlertService, WeatherForecastService } from "../../services";
import { WeatherForecast } from "../../models";

@Component({
    selector: 'fetchdata',
    templateUrl: './fetchdata.component.html'
})
export class FetchDataComponent implements OnInit {

    public forecasts: WeatherForecast[];

    constructor(
        private alertService: AlertService,
        private weatherForecastService: WeatherForecastService) { }

    ngOnInit() {
        this.weatherForecastService.getAll()
            .subscribe(data => {
                this.forecasts = data
            }, error => {
                this.alertService.error(JSON.stringify(error.error));
            })
    }

}
