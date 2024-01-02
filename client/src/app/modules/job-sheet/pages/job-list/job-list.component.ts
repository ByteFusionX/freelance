import { Component } from '@angular/core';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent {

  selectedStatus!:number;


  status: { id: number, name: string }[] = [
    { id: 1, name: 'Work in progress' },
    { id: 2, name: 'Status2' },
    { id: 3, name: 'Status3' },
    { id: 4, name: 'Status4' },
  ];

  displayedColumns: string[] = ['jobId', 'customerName', 'description', 'salesPersonName','department','lpo','quotations','lpoValue','status'];

  dataSource = [
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
    {jobId: '1251', customerName: 'shiyas', description: 'enquiry done', salesPersonName: 'basim',department:'Engineering',lpo:'test',quotations:'test',lpoValue:'12999',status:'Work in progress'},
  ]


  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

}
