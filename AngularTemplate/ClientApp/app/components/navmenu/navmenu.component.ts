import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from "../../services";
import { User } from "../../models";

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent {

    currentUser: User | undefined;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService) { }

    ngOnInit() {
        this.authenticationService.getLoginStatusEvent()
            .subscribe(x => {
                this.currentUser = this.authenticationService.currentUser;
            });
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }

}
