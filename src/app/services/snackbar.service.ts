import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { EntitySnackbarComponent } from 'app/pages/common/entity/entity-snackbar/entity-snackbar.component';

@Injectable({
providedIn: 'root'
})

export class SnackbarService {

    constructor(private snackbar: MatSnackBar) { }

    public open(message: string, action?: string, config?: MatSnackBarConfig) {
        EntitySnackbarComponent.message = message;
        EntitySnackbarComponent.action = action;

        this.snackbar.openFromComponent(EntitySnackbarComponent, config);
    }
}