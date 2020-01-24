
import { ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
// AutoComplete Validators
export class AutoCompleteValidators {
    // object 
    public static validObject(): ValidatorFn | any {
        return (control: AbstractControl[]) => {
            if (!(control instanceof FormControl)) return;

            let value = control.value;
            let valid;
            if (value == '') { return; }
            valid = this.hasJsonStructure(JSON.stringify(value));
            return valid == false ? { validObject : true } : null;
        }
    }

    public static hasJsonStructure(str) {
        if (typeof str !== 'string') return false;
        try {
            const result = JSON.parse(str);
            const type = Object.prototype.toString.call(result);
            return type === '[object Object]' 
                || type === '[object Array]';
        } catch (err) {
            return false;
        }
    }
}