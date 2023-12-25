import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css']
})
export class EnquiryComponent {

  constructor(public dialog:MatDialog){}

  displayedColumns: string[] = ['enquiryId', 'customerName', 'enquiryDescription', 'salesPersonName','department','status'];

    dataSource = [
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'},
    {enquiryId: 'Basim', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim',department:'Engineering',status:'Work in progress'}
  ];

openDialog(){
  const dialogRef = this.dialog.open(CreateEnquiryDialog)
  dialogRef.afterClosed().subscribe(result=>{
    console.log(result)
  })
}

}
