import { AbstractControl } from '@angular/forms'
//, ValidatorFn, FormGroup, ValidationErrors
export function decimalValueValidator(
    control: AbstractControl
): { [key: string]: any } | null {
    let valid = /^(\d*\.)?\d+$/.test(control.value)
    return valid
        ? null
        : { invalidNumber: { valid: false, value: control.value } }
}

// export const decimalValueValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
//     let valid = /^(\d*\.)?\d+$/.test(control.value)

//     return valid ? null : { invalidNumber: { valid: false, value: control.value } }
// };