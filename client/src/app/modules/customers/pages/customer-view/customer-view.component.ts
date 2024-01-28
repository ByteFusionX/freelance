import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    } else {
      this._router.navigate(['/customers'])
    }
  }

}
