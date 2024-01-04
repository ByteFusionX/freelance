import { Component } from '@angular/core';

@Component({
  selector: 'app-assigned-jobs-list',
  templateUrl: './assigned-jobs-list.component.html',
  styleUrls: ['./assigned-jobs-list.component.css']
})
export class AssignedJobsListComponent {

  displayedColumns: string[] = ['enqId', 'customerName', 'description', 'assignedBy','department','download','upload','send'];

  dataSource = [
    {enqId: '1251', customerName: 'shiyas', description: 'enquiry done', assignedBy: 'basim',department:'Engineering'},
  ]
}
