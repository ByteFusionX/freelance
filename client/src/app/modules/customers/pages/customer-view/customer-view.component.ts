import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';

@Component({
  selector: 'app-customer-view',
  templateUrl: './customer-view.component.html',
  styleUrls: ['./customer-view.component.css']
})
export class CustomerViewComponent {
  customerData!: getCustomer;

  constructor(private _router: Router) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.customerData = navigation.extras.state as getCustomer
      console.log(this.customerData)
    } else {
      this._router.navigate(['/customers'])
    }
  }

  onCustomerEdit(){
    const navigationExtras: NavigationExtras = {
      state: this.customerData
    };
    this._router.navigate(['/customers/edit'], navigationExtras);
  
  }

}
