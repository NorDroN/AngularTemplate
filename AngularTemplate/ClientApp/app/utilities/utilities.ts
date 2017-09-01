import { Injectable } from '@angular/core';

@Injectable()
export class Utilities {

    public static JsonTryParse(value?: string | null) {
        if (!value)
            return undefined;

        try {
            return JSON.parse(value);
        }
        catch (e) {
            return value;
        }
    }

}
