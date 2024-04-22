import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterQuote, QuoteStatus, getQuotation, Quotatation, quotatationForm, getQuotatation, nextQuoteData } from 'src/app/shared/interfaces/quotation.interface';
import { environment } from 'src/environments/environment';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  api: string = environment.api
  constructor(private http: HttpClient) { }

  saveQuotation(quotationDetails: Quotatation): Observable<Quotatation> {
    return this.http.post<Quotatation>(`${this.api}/quotation`, quotationDetails)
  }

  updateQuotation(quotationDetails: Quotatation, quoteId: string | undefined): Observable<Quotatation> {
    return this.http.patch<Quotatation>(`${this.api}/quotation/update/${quoteId}`, quotationDetails)
  }

  getQuotation(filterData: FilterQuote): Observable<getQuotation> {
    return this.http.post<getQuotation>(`${this.api}/quotation/get`, filterData)
  }

  getNextQuoteId(quoteData: nextQuoteData): Observable<{quoteId : string}> {
    return this.http.post<{quoteId : string}>(`${this.api}/quotation/nextQuoteId`, quoteData)
  }

  updateQuoteStatus(quoteId: string, status: QuoteStatus): Observable<QuoteStatus> {
    return this.http.patch<QuoteStatus>(`${this.api}/quotation/status/${quoteId}`, { status })
  }

  totalQuotations(access?: string, userId?: string): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.api}/quotation/total?access=${access}&userId=${userId}`)
  }


  uploadLpo(lpoData: FormData): Observable<any> {
    return this.http.post<any>(`${this.api}/quotation/lpo`, lpoData)
  }

  getBase64ImageFromURL(url: string) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  async generatePDF(quoteData: getQuotatation) {
    const items = quoteData.items
    
    if (!quoteData.quoteId) {
      let getQuoteIdData: nextQuoteData = {
          department: quoteData.department,
          createdBy: quoteData.createdBy._id,
          date: quoteData.date
      };
      this.getNextQuoteId(getQuoteIdData).subscribe((res) => {
              quoteData.quoteId = res.quoteId;
      });
  }
    // Table header
    const tableHeader = [
      { text: 'Sl.\nNo', style: 'tableSlNo' },
      { text: 'Part Number/Description', style: 'tableHeader' },
      { text: 'QTY', style: 'tableHeader' },
      { text: 'Unit', style: 'tableHeader' },
      { text: 'Unit Price', style: 'tableHeader' },
      { text: 'Total Cost', style: 'tableHeader' }
    ];

    // Table body
    const tableBody: any[] = [];
    let totalCost = 0;

    items.forEach(item => {
      let serialNumber = 1;
      tableBody.push([
        { text: item.itemName, colSpan: 6, style: 'itemRow' },
        '', '', '', '', ''
      ]);
      item.itemDetails.forEach(detail => {
        const decimalMargin = detail.profit / 100;
        const unitPrice = detail.unitCost / (1 - decimalMargin)
        const totalPrice = unitPrice * detail.quantity;
        totalCost += totalPrice;
        tableBody.push([
          { text: serialNumber++, style: 'tableText', alignment: 'center' },
          { text: detail.detail, style: 'tableText' },
          { text: detail.quantity, style: 'tableText', alignment: 'center' },
          { text: 'Ea', style: 'tableText', alignment: 'center' },
          { text: unitPrice.toFixed(2), style: 'tableText', alignment: 'center' },
          { text: totalPrice.toFixed(2), style: 'tableText', alignment: 'center' },
        ]);
      });
    });

    const tableFooter = [
      { text: 'Total Amount', style: 'tableFooter', colSpan: 5 }, '', '', '', '',
      { text: totalCost.toFixed(2), style: 'tableFooter' },
    ];

    const table = {
      table: {
        headerRows: 1,
        widths: [20, '*', 25, 40, 60, 60],
        body: [
          tableHeader,
          ...tableBody,
          tableFooter
        ],

      }
    };

    let termsAndConditions = '';
    if (quoteData.termsAndCondition.defaultNote) {
      termsAndConditions += `${quoteData.termsAndCondition.defaultNote}\n`;
    }
    if (quoteData.termsAndCondition.text) {
      termsAndConditions += `${quoteData.termsAndCondition.text}`;
    }

    let customerNotes = '';
    if (quoteData.customerNote.defaultNote) {
      customerNotes += `${quoteData.customerNote.defaultNote}\n`;
    }
    if (quoteData.customerNote.text) {
      customerNotes += `${quoteData.customerNote.text}`;
    }


    const documentDefinition: any = {
      background: {
        image: await this.getBase64ImageFromURL(
          "../../assets/images/logo.webp"
        ),
        width: 450,
        alignment: 'center',
        valign: 'center',
        margin: [0, 220, 0, 0]
      },
      header: {
        image: await this.getBase64ImageFromURL(
          "../../assets/images/pdfheader.jpg"
        ),
        width: 550,
        alignment: 'center',
        margin: [0, 25, 0, 0]
      },
      footer: {
        image: await this.getBase64ImageFromURL(
          "../../assets/images/pdfFooter.png"
        ),
        width: 600,
        alignment: 'center',
        margin: [0, 25, 0, 0]
      },
      pageMargins: [45, 115, 45, 100],
      content: [

        {
          "style": "header",
          "table": {
            "heights": 20,
            "widths": "*",
            "body": [[
              {
                style: 'mainHead',
                "border": [false, false, false, false],
                "fillColor": "#1E3964",
                "text": "COMMERCIAL PROPOSAL",
                "alignment": "center",
                "margin": [0, 3, 0, 3]
              }]
            ]
          }
        },

        {
          style: 'tableExample',
          color: '#444',
          table: {
            widths: [78.66, '*', 43.24, '*', 73.60, 'auto'],
            body: [
              [{ style: 'tableHead', text: 'Company:', alignment: 'left' }, { style: 'tableHead', text: quoteData.client.companyName, alignment: 'left', colSpan: 5 }, {}, {}, {}, {}],
              [{ style: 'tableHead', text: 'Attention:', alignment: 'left' }, { style: 'tableHead', text: `${quoteData.attention.courtesyTitle + ' ' + quoteData.attention.firstName + ' ' + quoteData.attention.lastName}`, alignment: 'left', colSpan: 3, bold: true }, {}, {}, { style: 'tableHead', text: 'Date:', alignment: 'left' }, { style: 'tableHead', text: '14-03-2024', alignment: 'left' }],
              [{ style: 'tableHead', text: 'Address:', alignment: 'left' }, { style: 'tableHead', text: '', alignment: 'left', colSpan: 3 }, {}, {}, { style: 'tableHead', text: 'Client Ref:', alignment: 'left' }, { style: 'tableHead', text: '', alignment: 'left' }],
              [{ style: 'tableHead', text: 'Client Tel:', alignment: 'left' }, { style: 'tableHead', text: '+974', alignment: 'left' }, { style: 'tableHead', text: 'FAX:', alignment: 'center' }, { style: 'tableHead', text: '+974', alignment: 'left' }, { style: 'tableHead', text: 'Salesperson:', alignment: 'left' }, { style: 'tableHead', text: `${quoteData.createdBy.firstName + ' ' + quoteData.createdBy.lastName}`, alignment: 'left' }],
              [{ style: 'tableHead', text: 'Subject:', alignment: 'left' }, { style: 'tableHead', text: quoteData.subject, alignment: 'left', colSpan: 3 }, {}, {}, { style: 'tableHead', text: 'Quote Ref:', alignment: 'left' }, { style: 'quoteId', text: quoteData.quoteId, alignment: 'left' }],
            ]
          }
        },
        { text: 'Respected Sir/ Ma’am,', style: 'text' },
        { text: 'Reference to your query on the above subject, we are pleased to enclose herewith our OFFER for your perusal and due consideration.', style: 'text' },
        { text: 'Thanking you for your co-operation and assuring you of our commitment to always providing professional support and services.', style: 'text', margin: [0, 10, 0, 15] },
        table,
        { text: 'TERMS & CONDITIONS', style: 'subHeading' },
        { text: termsAndConditions, style: 'text' },
        { text: 'Notes', style: 'subHeading' },
        { text: customerNotes, style: 'text' }, {
          columns: [
            {
              text: [
                { text: 'Thanking you\nFor ', style: 'footerText' },
                { text: 'Neuron Technologies W.L.L', style: 'footerBoldText' }]
            },
            {
              image: await this.getBase64ImageFromURL(
                "../../assets/images/stamp.jpg"
              ),
              width: 90,
              margin: [30, 5, 0, 0]
            },
            { text: 'Subin Suresh\nMob: - +974 55007257\nE: sales@neuron.com.qa', style: 'footerText', alignment: 'right' },
          ],
          margin: [0, 10, 0, 0],
          pageBreak: 'avoid'
        },
      ],
      styles: {
        mainHead: {
          fontSize: 14,
          color: 'white',
          bold: true
        },
        tableHead: {
          color: 'black',
          fontSize: 10
        },
        quoteId: {
          color: 'black',
          fontSize: 9
        },
        tableData: {
          fontSize: 11
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        pageNumber: {
          color: 'grey',
          fontSize: 10
        },
        text: {
          fontSize: 10,
          margin: [0, 5, 0, 0]
        },
        subHeading: {
          fontSize: 11,
          margin: [0, 12, 0, 0],
          decoration: 'underline',
          bold: true
        },
        tableHeader: {
          fontSize: 12,
          alignment: 'center',
          margin: [0, 10],
          fillColor: "#1E4E79",
          color: 'white',
          bold: true
        },
        tableSlNo: {
          bold: true,
          fontSize: 12,
          alignment: 'center',
          margin: [0, 5],
          fillColor: "#1E4E79",
          color: 'white'
        },
        itemRow: {
          bold: true,
          fontSize: 11,
          alignment: 'center',
          fillColor: "#D0CECE"
        },
        tableFooter: {
          bold: true,
          fontSize: 11,
          alignment: 'center',
          fillColor: "#BFBEBE",
          margin: [0, 5, 0, 5]
        },
        tableText: {
          fontSize: 10
        },
        footerText: {
          fontSize: 10,
          margin: [5, 10, 0, 0]
        },
        footerBoldText: {
          fontSize: 10,
          margin: [5, 10, 0, 0],
          bold: true
        }
      },
      defaultStyle: {
        // alignment: 'justify'
      }

    }


    const pdfDoc = pdfMake.createPdf(documentDefinition);
    return pdfDoc
  }


}
