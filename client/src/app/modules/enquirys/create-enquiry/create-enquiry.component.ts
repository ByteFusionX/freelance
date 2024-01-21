import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgSelectConfig } from '@ng-select/ng-select';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { AssignPresaleComponent } from '../assign-presale/assign-presale.component';
import { Observable, Subscription } from 'rxjs';
import { fileEnterState } from '../enquiry-animations';
import { Enquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-enquiry',
  templateUrl: './create-enquiry.component.html',
  styleUrls: ['./create-enquiry.component.css'],
  animations: [fileEnterState],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEnquiryDialog implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef;

  customers$!: Observable<getCustomer[]>;
  enquirys$!: Observable<Enquiry[]>;
  contacts: ContactDetail[] = []
  departments$!: Observable<getDepartment[]>;
  selectedDep!: string;
  selectedFiles: File[] = []
  private subscriptions = new Subscription();
  tokenData!: { id: string, employeeId: string };

  today = new Date().toISOString().substring(0, 10)
  formData = this._fb.group({
    client: [undefined, Validators.required],
    contact: [undefined, Validators.required],
    department: [undefined, Validators.required],
    salesPerson: ['', Validators.required],
    title: ['', Validators.required],
    date: [this.today, Validators.required],
    attachments: new FormControl(this.selectedFiles),
    presale: [],
    enquiryId: '',
    status: 'Work In Progress'
  })

  constructor(
    public dialogRef: MatDialogRef<CreateEnquiryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private dialog: MatDialog,
    private config: NgSelectConfig,
    private _fb: FormBuilder,
    private _customerService: CustomerService,
    private _profileService: ProfileService,
    private _enquiryService: EnquiryService,
    private _employeeService: EmployeeService,
    private router: Router,
  ) {
    this.config.notFoundText = 'Wait a few Sec';
  }

  ngOnInit(): void {
    this.getEmployee()
    this.getCustomers()
    this.getDepartments()
    this.data = String(Number(this.data) + 1).padStart(3, '0')
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  onChange(change: string) {
    if (change && this.customers$) {
      this.subscriptions.add(this.customers$.subscribe((data) => {
        let customer = data.find((contact) => contact._id == change)
        if (customer) {
          this.contacts = customer.contactDetails
        }
      }))
    } else {
      this.contacts = []
      this.formData.controls.contact.setValue(undefined)
    }
  }

  onFileSelected(event: any) {
    let files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const newFile = files[i]
      const exist = this.selectedFiles.some(file => file.name === newFile.name)
      if (!exist) {
        this.selectedFiles.push(files[i])
      }
    }
  }

  onFileRemoved(index: number) {
    this.selectedFiles.splice(index, 1)
    this.fileInput.nativeElement.value = '';
  }

  onSubmit() {
    if (this.formData.valid) {
      this.generateId()
      setTimeout(() => {
        this.formData.controls.salesPerson.setValue(this.tokenData.id)
        let data = this.formData.value as Partial<Enquiry>
        this.subscriptions.add(
          this._enquiryService.createEnquiry(data).subscribe((data) => {
            if (data) {
              this.dialogRef.close(data)
            }
          })
        )
      }, 300)
    }
  }

  generateId() {
    let contactId = this.formData.controls.contact.value
    let contact = <ContactDetail>this.contacts.find(data => data._id == contactId)
    let name = contact.firstName[0].toUpperCase() + contact.lastName[0].toUpperCase()

    let formDate = <string>this.formData.controls.date.value
    const [year, month] = formDate.split('-');
    let date = `-${month}/${year.slice(2)}`
    let enqId = ['ENQ-NT', name, this.selectedDep + '' + date + '-' + this.data].join('/')
    this.formData.controls.enquiryId.setValue(enqId)
  }

  onClose() {
    this.dialogRef.close()
  }

  createCustomer() {
    this.onClose()
  }

  onClickPresale() {
    const presaleDialog = this.dialog.open(AssignPresaleComponent)
    presaleDialog.afterClosed().subscribe((data) => {
      if (data) {
        this.formData.controls.presale.setValue(data)
        this.formData.controls.status.setValue('Assigned To Presales')
      }
    })
  }

  onClickQuote() {
    if (this.formData.valid) {
      this.generateId()
      setTimeout(() => {
        this.formData.controls.salesPerson.setValue(this.tokenData.id)
        let data = this.formData.value as Partial<Enquiry>
        this.subscriptions.add(
          this._enquiryService.createEnquiry(data).subscribe((data) => {
            if (data) {
              this._enquiryService.emitToQuote(data)
              this.dialogRef.close()
              this.router.navigate(['/quotations/create'])
            }
          })
        )
      }, 300)
    }
  }

  getCustomers() {
    this.customers$ = this._customerService.getCustomers()
  }

  getDepartments() {
    this.departments$ = this._profileService.getDepartments()
  }

  getEmployee() {
    this.tokenData = this._employeeService.employeeToken()
    this._employeeService.getEmployee(this.tokenData.id).subscribe((data) => {
      if (data) {
        this.formData.controls.salesPerson.setValue(data.firstName + ' ' + data.lastName)
      }
    })
  }

  getDepartment(id: string) {
    this.subscriptions.add(
      this.departments$.subscribe((data) => {
        let department = data.find(val => val._id == id)
        if (department) {
          this.selectedDep = department.departmentName.toUpperCase().slice(0, 4)
        }
      })
    )
  }
}
