import { Pipe, PipeTransform } from '@angular/core';

@Pipe ({ name: 'searchFilter' })

export class SearchFilterPipe implements PipeTransform {
    transform (value: any, search: string): any {
        if (!search) {return value;}
        let resp = value.filter(r => {
            if (!r) {return;}
            return r.n.toLowerCase().indexOf(search.toLowerCase()) !== -1;
        })
        return resp;
    }
}