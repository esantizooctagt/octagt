import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Country, Customer } from '@app/_models';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomerService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
// import { delay } from 'rxjs/operators';
// import Countries from '@shared/countries.json';


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  @Input() customer: Customer;
  get fCustomer() { return this.customerForm.controls; }

  message: string='';
  submitted = false;
  loading = false;
  companyId: string='';
  loadList: Country[]=[];
  nameList: string='';
  requiredCountry: boolean=false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router,
    private data: MonitorService,
    private alertService: AlertService 
  ) { }

  customerForm = this.fb.group({
    CustomerId: [''],
    CompanyId: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    Address: [''],
    House_No: [''],
    Country: new FormControl('',Validators.required),
    State: [''],
    Phone: [''],
    Postal_Code: [''],
    Tax_Number: ['', [Validators.required, Validators.minLength(2)]],
    Is_Exent:[0],
    Reason: [''],
    Email: ['', Validators.email],
    Status: [1]
  })

  ngOnInit() {
    this.nameList='Country';
    this.requiredCountry = true;
    this.companyId = this.authService.companyId();  
    this.searchList();
    this.data.monitorMessage
      .subscribe((message: any) => {
        this.message = message;
      });
    this.onValueChanges();
  }

  onValueChanges(): void {
    this.customerForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.customerForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.customerForm.controls["Status"].setValue(0);
      }
      if (val.Is_Exent === true) {
        this.customerForm.controls["Is_Exent"].setValue(1);
        this.customerForm.get("Reason").setValidators([Validators.required, Validators.minLength(3)]);
        this.customerForm.get("Is_Exent").updateValueAndValidity();
        this.customerForm.get("Reason").updateValueAndValidity();
      }
      if (val.Is_Exent === false){
        this.customerForm.controls["Is_Exent"].setValue(0);
        this.customerForm.controls["Reason"].setValue('');
        this.customerForm.get("Reason").setValidators(null);
        this.customerForm.get("Is_Exent").updateValueAndValidity();
        this.customerForm.get("Reason").updateValueAndValidity();
      }
      if (val.Country === null){
        this.customerForm.controls["Country"].setValue('');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.customer.currentValue != undefined) {
      let customerResult = changes.customer.currentValue;
      this.customerForm.reset({Is_Exent:0, Status:1, CustomerId:'', CompanyId:'', Reason:'', Email:'', Postal_Code:'', State:'', Name:'', Phone:'', Tax_Number:'', Address:'', House_No:'', Country:''});
      this.customerService.getCustomer(customerResult.Customer_Id).subscribe((res: any) => {
        if (res != null) {
          let countryValue = this.loadList.filter(r => {
            if (!r) {return;}
            return r.c.toLowerCase().indexOf(res.Country.toLowerCase()) !== -1;
          });
          this.customerForm.setValue({
            CustomerId: res.Customer_Id,
            CompanyId: res.Company_Id,
            Name: res.Name,
            Address: res.Address,
            House_No: res.House_No,
            Country: JSON.stringify(countryValue[0]),
            State: res.State,
            Phone: res.Phone,
            Postal_Code: res.Postal_Code,
            Tax_Number: res.Tax_Number,
            Is_Exent: res.Is_Exent,
            Reason: res.Reason,
            Email: res.Email,
            Status: res.Status
          });
          // this.customerForm.markAsPending();
        }
      },
      error => { 
        this.alertService.error('Error ! ' + error.Message);
      });
    }
  }

  onSubmit(){
    // stop here if form is invalid
    if (this.customerForm.invalid) {
      return;
    }

    let customerId = this.customerForm.value.CustomerId;
    this.submitted = true;
    this.loading = true;
    if (customerId !== '' && customerId !== null) {  
      let countryId = this.customerForm.value.Country;
      let dataForm =  { 
        "Name": this.customerForm.value.Name,
        "Address": this.customerForm.value.Address,
        "House_No": this.customerForm.value.House_No,
        "Country": countryId.c,
        "State": this.customerForm.value.State,
        "Phone": this.customerForm.value.Phone,
        "Postal_Code": this.customerForm.value.Postal_Code,
        "Tax_Number": this.customerForm.value.Tax_Number,
        "Is_Exent": this.customerForm.value.Is_Exent,
        "Reason": this.customerForm.value.Reason,
        "Email": this.customerForm.value.Email,
        "Status": this.customerForm.value.Status
      }
      this.customerService.updateCustomer(customerId, dataForm)
        .subscribe(
          response =>  {
            this.alertService.success('Customer created successful');
            this.submitted = false;
            this.loading = false;
            this.customerForm.reset({Is_Exent:0, Status:1, CustomerId:'', CompanyId:'', Reason:'', Email:'', Postal_Code:'', State:'', Name:'', Phone:'', Tax_Number:'', Address:'', House_No:'', Country:''});
            this.data.changeData('customers');
          },
          error => { 
            this.loading = false;
            this.alertService.error('Error ! ' + error.Message);
          }
        );
    } else {
      let countryId = this.customerForm.value.Country;
      let dataForm =  { 
        "CompanyId": this.companyId,
        "Name": this.customerForm.value.Name,
        "Address": this.customerForm.value.Address,
        "House_No": this.customerForm.value.House_No,
        "Country": countryId.c,
        "State": this.customerForm.value.State,
        "Phone": this.customerForm.value.Phone,
        "Postal_Code": this.customerForm.value.Postal_Code,
        "Tax_Number": this.customerForm.value.Tax_Number,
        "Is_Exent": this.customerForm.value.Is_Exent,
        "Reason": this.customerForm.value.Reason,
        "Email": this.customerForm.value.Email,
        "Status": this.customerForm.value.Status
      }
      this.customerService.postCustomer(dataForm)
        .subscribe(
          response => {
            this.alertService.success('Customer updated successful');
            this.submitted = false;
            this.loading = false;
            this.customerForm.reset({Is_Exent:0, Status:1, CustomerId:'', CompanyId:'', Reason:'', Email:'', Postal_Code:'', State:'', Name:'', Phone:'', Tax_Number:'', Address:'', House_No:'', Country:''});
            this.data.changeData('customers');
          },
          error => { 
            this.loading = false;
            this.alertService.error('Error ! ' + error.Message);
          }
        );
    }
  }

  onCancel(){
    this.submitted = true;
    this.customerForm.reset({Is_Exent:0, Status:1, CustomerId:'', CompanyId:'', Reason:'', Email:'', Postal_Code:'', State:'', Name:'', Phone:'', Tax_Number:'', Address:'', House_No:'', Country:''});
    this.data.changeData('customers');
  }

  searchList(){
    this.loadList = [{"n":"Afghanistan","c":"AFA"},{"n":"Åland Islands","c":"ALA"},{"n":"Albania","c":"ALB"},{"n":"Algeria","c":"DZA"},{"n":"American Samoa","c":"ASM"},{"n":"Andorra","c":"AND"},{"n":"Angola","c":"AGO"},{"n":"Anguilla","c":"AIA"},{"n":"Antarctica","c":"ATA"},{"n":"Antigua and Barbuda","c":"ATG"},{"n":"Argentina","c":"ARG"},{"n":"Armenia","c":"ARM"},{"n":"Aruba","c":"ABW"},{"n":"Australia","c":"AUS"},{"n":"Austria","c":"AUT"},{"n":"Azerbaijan","c":"AZE"},{"n":"Bahamas","c":"BHS"},{"n":"Bahrain","c":"BHR"},{"n":"Bangladesh","c":"BGD"},{"n":"Barbados","c":"BRB"},{"n":"Belarus","c":"BLR"},{"n":"Belgium","c":"BEL"},{"n":"Belize","c":"BLZ"},{"n":"Benin","c":"BEN"},{"n":"Bermuda","c":"BMU"},{"n":"Bhutan","c":"BTN"},{"n":"Bolivia (Plurinational State of)","c":"BOL"},{"n":"Bonaire, Sint Eustatius and Saba","c":"BES"},{"n":"Bosnia and Herzegovina","c":"BIH"},{"n":"Botswana","c":"BWA"},{"n":"Bouvet Island","c":"BVT"},{"n":"Brazil","c":"BRA"},{"n":"British Indian Ocean Territory","c":"IOT"},{"n":"Brunei Darussalam","c":"BRN"},{"n":"Bulgaria","c":"BGR"},{"n":"Burkina Faso","c":"BFA"},{"n":"Burundi","c":"BDI"},{"n":"Cabo Verde","c":"CPV"},{"n":"Cambodia","c":"KHM"},{"n":"Cameroon","c":"CMR"},{"n":"Canada","c":"CAN"},{"n":"Cayman Islands","c":"CYM"},{"n":"Central African Republic","c":"CAF"},{"n":"Chad","c":"TCD"},{"n":"Chile","c":"CHL"},{"n":"China","c":"CHN"},{"n":"Christmas Island","c":"CXR"},{"n":"Cocos (Keeling) Islands","c":"CCK"},{"n":"Colombia","c":"COL"},{"n":"Comoros","c":"COM"},{"n":"Congo","c":"COG"},{"n":"Congo, Democratic Republic of the","c":"COD"},{"n":"Cook Islands","c":"COK"},{"n":"Costa Rica","c":"CRI"},{"n":"Côte d'Ivoire","c":"CIV"},{"n":"Croatia","c":"HRV"},{"n":"Cuba","c":"CUB"},{"n":"Curaçao","c":"CUW"},{"n":"Cyprus","c":"CYP"},{"n":"Czechia","c":"CZE"},{"n":"Denmark","c":"DNK"},{"n":"Djibouti","c":"DJI"},{"n":"Dominica","c":"DMA"},{"n":"Dominican Republic","c":"DOM"},{"n":"Ecuador","c":"ECU"},{"n":"Egypt","c":"EGY"},{"n":"El Salvador","c":"SLV"},{"n":"Equatorial Guinea","c":"GNQ"},{"n":"Eritrea","c":"ERI"},{"n":"Estonia","c":"EST"},{"n":"Eswatini","c":"SWZ"},{"n":"Ethiopia","c":"ETH"},{"n":"Falkland Islands (Malvinas)","c":"FLK"},{"n":"Faroe Islands","c":"FRO"},{"n":"Fiji","c":"FJI"},{"n":"Finland","c":"FIN"},{"n":"France","c":"FRA"},{"n":"French Guiana","c":"GUF"},{"n":"French Polynesia","c":"PYF"},{"n":"French Southern Territories","c":"ATF"},{"n":"Gabon","c":"GAB"},{"n":"Gambia","c":"GMB"},{"n":"Georgia","c":"GEO"},{"n":"Germany","c":"DEU"},{"n":"Ghana","c":"GHA"},{"n":"Gibraltar","c":"GIB"},{"n":"Greece","c":"GRC"},{"n":"Greenland","c":"GRL"},{"n":"Grenada","c":"GRD"},{"n":"Guadeloupe","c":"GLP"},{"n":"Guam","c":"GUM"},{"n":"Guatemala","c":"GTM"},{"n":"Guernsey","c":"GGY"},{"n":"Guinea","c":"GIN"},{"n":"Guinea-Bissau","c":"GNB"},{"n":"Guyana","c":"GUY"},{"n":"Haiti","c":"HTI"},{"n":"Heard Island and McDonald Islands","c":"HMD"},{"n":"Holy See","c":"VAT"},{"n":"Honduras","c":"HND"},{"n":"Hong Kong","c":"HKG"},{"n":"Hungary","c":"HUN"},{"n":"Iceland","c":"ISL"},{"n":"India","c":"IND"},{"n":"Indonesia","c":"IDN"},{"n":"Iran (Islamic Republic of)","c":"IRN"},{"n":"Iraq","c":"IRQ"},{"n":"Ireland","c":"IRL"},{"n":"Isle of Man","c":"IMN"},{"n":"Israel","c":"ISR"},{"n":"Italy","c":"ITA"},{"n":"Jamaica","c":"JAM"},{"n":"Japan","c":"JPN"},{"n":"Jersey","c":"JEY"},{"n":"Jordan","c":"JOR"},{"n":"Kazakhstan","c":"KAZ"},{"n":"Kenya","c":"KEN"},{"n":"Kiribati","c":"KIR"},{"n":"Korea (Democratic People's Republic of)","c":"PRK"},{"n":"Korea, Republic of","c":"KOR"},{"n":"Kuwait","c":"KWT"},{"n":"Kyrgyzstan","c":"KGZ"},{"n":"Lao People's Democratic Republic","c":"LAO"},{"n":"Latvia","c":"LVA"},{"n":"Lebanon","c":"LBN"},{"n":"Lesotho","c":"LSO"},{"n":"Liberia","c":"LBR"},{"n":"Libya","c":"LBY"},{"n":"Liechtenstein","c":"LIE"},{"n":"Lithuania","c":"LTU"},{"n":"Luxembourg","c":"LUX"},{"n":"Macao","c":"MAC"},{"n":"Madagascar","c":"MDG"},{"n":"Malawi","c":"MWI"},{"n":"Malaysia","c":"MYS"},{"n":"Maldives","c":"MDV"},{"n":"Mali","c":"MLI"},{"n":"Malta","c":"MLT"},{"n":"Marshall Islands","c":"MHL"},{"n":"Martinique","c":"MTQ"},{"n":"Mauritania","c":"MRT"},{"n":"Mauritius","c":"MUS"},{"n":"Mayotte","c":"MYT"},{"n":"Mexico","c":"MEX"},{"n":"Micronesia (Federated States of)","c":"FSM"},{"n":"Moldova, Republic of","c":"MDA"},{"n":"Monaco","c":"MCO"},{"n":"Mongolia","c":"MNG"},{"n":"Montenegro","c":"MNE"},{"n":"Montserrat","c":"MSR"},{"n":"Morocco","c":"MAR"},{"n":"Mozambique","c":"MOZ"},{"n":"Myanmar","c":"MMR"},{"n":"Namibia","c":"NAM"},{"n":"Nauru","c":"NRU"},{"n":"Nepal","c":"NPL"},{"n":"Netherlands","c":"NLD"},{"n":"New Caledonia","c":"NCL"},{"n":"New Zealand","c":"NZL"},{"n":"Nicaragua","c":"NIC"},{"n":"Niger","c":"NER"},{"n":"Nigeria","c":"NGA"},{"n":"Niue","c":"NIU"},{"n":"Norfolk Island","c":"NFK"},{"n":"North Macedonia","c":"MKD"},{"n":"Northern Mariana Islands","c":"MNP"},{"n":"Norway","c":"NOR"},{"n":"Oman","c":"OMN"},{"n":"Pakistan","c":"PAK"},{"n":"Palau","c":"PLW"},{"n":"Palestine, State of","c":"PSE"},{"n":"Panama","c":"PAN"},{"n":"Papua New Guinea","c":"PNG"},{"n":"Paraguay","c":"PRY"},{"n":"Peru","c":"PER"},{"n":"Philippines","c":"PHL"},{"n":"Pitcairn","c":"PCN"},{"n":"Poland","c":"POL"},{"n":"Portugal","c":"PRT"},{"n":"Puerto Rico","c":"PRI"},{"n":"Qatar","c":"QAT"},{"n":"Réunion","c":"REU"},{"n":"Romania","c":"ROU"},{"n":"Russian Federation","c":"RUS"},{"n":"Rwanda","c":"RWA"},{"n":"Saint Barthélemy","c":"BLM"},{"n":"Saint Helena, Ascension and Tristan da Cunha","c":"SHN"},{"n":"Saint Kitts and Nevis","c":"KNA"},{"n":"Saint Lucia","c":"LCA"},{"n":"Saint Martin (French part)","c":"MAF"},{"n":"Saint Pierre and Miquelon","c":"SPM"},{"n":"Saint Vincent and the Grenadines","c":"VCT"},{"n":"Samoa","c":"WSM"},{"n":"San Marino","c":"SMR"},{"n":"Sao Tome and Principe","c":"STP"},{"n":"Saudi Arabia","c":"SAU"},{"n":"Senegal","c":"SEN"},{"n":"Serbia","c":"SRB"},{"n":"Seychelles","c":"SYC"},{"n":"Sierra Leone","c":"SLE"},{"n":"Singapore","c":"SGP"},{"n":"Sint Maarten (Dutch part)","c":"SXM"},{"n":"Slovakia","c":"SVK"},{"n":"Slovenia","c":"SVN"},{"n":"Solomon Islands","c":"SLB"},{"n":"Somalia","c":"SOM"},{"n":"South Africa","c":"ZAF"},{"n":"South Georgia and the South Sandwich Islands","c":"SGS"},{"n":"South Sudan","c":"SSD"},{"n":"Spain","c":"ESP"},{"n":"Sri Lanka","c":"LKA"},{"n":"Sudan","c":"SDN"},{"n":"Surin","c":"SUR"},{"n":"Svalbard and Jan Mayen","c":"SJM"},{"n":"Sweden","c":"SWE"},{"n":"Switzerland","c":"CHE"},{"n":"Syrian Arab Republic","c":"SYR"},{"n":"Taiwan, Province of China","c":"TWN"},{"n":"Tajikistan","c":"TJK"},{"n":"Tanzania, United Republic of","c":"TZA"},{"n":"Thailand","c":"THA"},{"n":"Timor-Leste","c":"TLS"},{"n":"Togo","c":"TGO"},{"n":"Tokelau","c":"TKL"},{"n":"Tonga","c":"TON"},{"n":"Trinidad and Tobago","c":"TTO"},{"n":"Tunisia","c":"TUN"},{"n":"Turkey","c":"TUR"},{"n":"Turkmenistan","c":"TKM"},{"n":"Turks and Caicos Islands","c":"TCA"},{"n":"Tuvalu","c":"TUV"},{"n":"Uganda","c":"UGA"},{"n":"Ukraine","c":"UKR"},{"n":"United Arab Emirates","c":"ARE"},{"n":"United Kingdom of Great Britain and Northern Ireland","c":"GBR"},{"n":"United States of America","c":"USA"},{"n":"United States Minor Outlying Islands","c":"UMI"},{"n":"Uruguay","c":"URY"},{"n":"Uzbekistan","c":"UZB"},{"n":"Vanuatu","c":"VUT"},{"n":"Venezuela (Bolivarian Republic of)","c":"VEN"},{"n":"Viet Nam","c":"VNM"},{"n":"Virgin Islands (British)","c":"VGB"},{"n":"Virgin Islands (U.S.)","c":"VIR"},{"n":"Wallis and Futuna","c":"WLF"},{"n":"Western Sahara","c":"ESH"},{"n":"Yemen","c":"YEM"},{"n":"Zambia","c":"ZMB"},{"n":"Zimbabwe","c":"ZWE"}];
  }
}

  /* let temp: string[]=[];
    // Countries.Result.forEach(element => {
    //   const res = {"name":element.name,"code":element.alpha}
    //   temp.push(JSON.stringify(res));
    // });      
    //   console.log('element countriy '+ JSON.parse(JSON.stringify(temp)));
    // });*/