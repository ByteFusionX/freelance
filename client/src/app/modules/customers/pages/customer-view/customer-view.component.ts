import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';

@Component({
  selector: 'app-customer-view',
  templateUrl: './customer-view.component.html',
  styleUrls: ['./customer-view.component.css']
})
export class CustomerViewComponent {
  customerData!: getCustomer;

  constructor(
    private _router: Router,
    private _employeeService: EmployeeService,
    private _customerService: CustomerService,
    private route: ActivatedRoute,
    public _toast: ToastrService,
  ) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.customerData = navigation.extras.state as getCustomer
    } else {
      const customerId = this.route.snapshot.paramMap.get('customerId');
      if (customerId) {
        let access;
        let userId;
        this._employeeService.employeeData$.subscribe((employee) => {
          access = employee?.category.privileges.customer.viewReport
          userId = employee?._id
        })
        this._customerService.getCustomerByClientRef(customerId, access, userId).subscribe((res) => {
          if (res) {
            if (res.access) {
              this.customerData = res.customerData;
            } else {
              this._toast.warning('This user detail cannot be displayed to you due to the permissions assigned')
              this._router.navigate(['/customers'])
              console.log('sugar')
            }
          } else {
            console.log('andi ')
            this._router.navigate(['/customers'])
          }
        })
      } else {
        this._router.navigate(['/customers'])
      }
    }
  }

  onCustomerEdit() {
    const navigationExtras: NavigationExtras = {
      state: this.customerData
    };
    this._router.navigate(['/customers/edit'], navigationExtras);

  }

}
