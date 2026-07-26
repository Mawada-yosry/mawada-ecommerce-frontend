import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../shared/header/header';

@Component({
    selector: 'app-dashboard',
    imports: [RouterOutlet, Header],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard {
}