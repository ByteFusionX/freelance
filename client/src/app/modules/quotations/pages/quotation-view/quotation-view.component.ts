import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { quotatation } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-quotation-view',
  templateUrl: './quotation-view.component.html',
  styleUrls: ['./quotation-view.component.css']
})
export class QuotationViewComponent {
  quoteData!: quotatation;

  constructor(
    private _router: Router
  ) { 
    this.getQuoteData();
  }

  getQuoteData(){
    const navigation = this._router.getCurrentNavigation();

    if (navigation && navigation.extras.state) {
      this.quoteData = navigation.extras.state as quotatation
    } else {
      this._router.navigate(['/quotations']);
    }
  }

  calculateTotalCost(i: number) {
    return this.quoteData.items[i].quantity * this.quoteData.items[i].unitCost;
  }

  calculateUnitPrice(i: number) {
    const decimalMargin = this.quoteData.items[i].profit / 100;
    return this.quoteData.items[i].unitCost / (1 - decimalMargin)
  }

  calculateTotalPrice(i: number) {
    return this.calculateUnitPrice(i) * this.quoteData.items[i].quantity;
  }

  calculateAllTotalCost(){
    let totalCost = 0;
    this.quoteData.items.forEach((item,i)=>{
      totalCost += this.calculateTotalCost(i)
    })
    return totalCost;
  }

  calculateSellingPrice():number{
    let totalCost = 0;
    this.quoteData.items.forEach((item,i)=>{
      totalCost += this.calculateTotalPrice(i)
    })
    return totalCost;
  } 

  calculateTotalProfit():number{
    return ((this.calculateSellingPrice()-this.calculateAllTotalCost())/this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice():number{
    return this.calculateSellingPrice() - this.quoteData.totalDiscount
  }


}
