import { ObjectId } from "mongodb";
import { Filters } from "../interface/dashboard.interface";
import fs from 'fs';
import path from 'path';


export const calculateDiscountPrice = (quotation: any, items: any): number => {
    const calculateUnitPrice = (i: number, j: number): number => {
        const decimalMargin = items[i].itemDetails[j].profit / 100;
        return items[i].itemDetails[j].unitCost / (1 - decimalMargin);
    };

    const calculateTotalPrice = (i: number, j: number): number => {
        return calculateUnitPrice(i, j) * items[i].itemDetails[j].quantity;
    };

    const calculateSellingPrice = (): number => {
        let totalCost = 0;
        items.forEach((item: any, i: number) => {
            item.itemDetails.forEach((itemDetail: any, j: number) => {
                totalCost += calculateTotalPrice(i, j);
            });
        });
        return totalCost;
    };
    return calculateSellingPrice() - quotation.totalDiscount;
};

export const calculateTotalCost = (quotation: any, items: any): number => {
    let totalCost = 0;
    items.forEach((item: any) => {
        item.itemDetails.forEach((itemDetail: any) => {
            totalCost += itemDetail.unitCost * itemDetail.quantity;
        });
    });


    const totalAdditionalValue = quotation.dealData.additionalCosts.reduce((acc, curr) => {
        return acc += curr.value;
    }, 0)

    totalCost += totalAdditionalValue;
    return totalCost;
}

export const buildDashboardFilters = (filters: Filters) => {
    const matchFilter: any = {};

    if (filters) {

        if (filters.fromDate && filters.toDate) {
            matchFilter['createdDate'] = {
                $gte: new Date(filters.fromDate),
                $lt: new Date(filters.toDate)
            };
        } else if (filters.fromDate) {
            matchFilter['createdDate'] = { $gte: new Date(filters.fromDate) };
        } else if (filters.toDate) {
            matchFilter['createdDate'] = { $lt: new Date(filters.toDate) };
        }
        // Handle multiple salesPersons
        if (filters.salesPersonIds && filters.salesPersonIds.length > 0) {
            matchFilter['salesPerson._id'] = { $in: filters.salesPersonIds.map(id => new ObjectId(id)) };
        }

        // Handle multiple departments
        if (filters.departments && filters.departments.length > 0) {
            matchFilter['department._id'] = { $in: filters.departments.map(depId => new ObjectId(depId)) };
        }
    }

    
    return matchFilter;
}

export const calculateDiscountPricePipe = (input: string,discount:string) => {
    return {
        $subtract: [
            {
                $sum: {
                    $map: {
                        input: input,
                        as: 'item',
                        in: {
                            $sum: {
                                $map: {
                                    input: '$$item.itemDetails',
                                    as: 'itemDetail',
                                    in: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    '$$itemDetail.unitCost',
                                                    { $subtract: [1, { $divide: ['$$itemDetail.profit', 100] }] }
                                                ]
                                            },
                                            '$$itemDetail.quantity'
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            discount
        ]
    }
}

export const calculateCostPricePipe = (input: string) => {
    return {
        $sum: [
            {
                $sum: {
                    $map: {
                        input: input,
                        as: 'item',
                        in: {
                            $sum: {
                                $map: {
                                    input: '$$item.itemDetails',
                                    as: 'itemDetail',
                                    in: {
                                        $multiply: ['$$itemDetail.quantity', '$$itemDetail.unitCost']
                                    }
                                }
                            }
                        }
                    },

                }
            }, {
                $sum: {
                    $map: {
                        input: '$quotation.dealData.additionalCosts',
                        as: 'additionalCost',
                        in: '$$additionalCost.value'
                    },

                }
            }
        ]
    }
}

export const months = [
    { month: 1, name: 'Jan' },
    { month: 2, name: 'Feb' },
    { month: 3, name: 'Mar' },
    { month: 4, name: 'Apr' },
    { month: 5, name: 'May' },
    { month: 6, name: 'June' },
    { month: 7, name: 'July' },
    { month: 8, name: 'Aug' },
    { month: 9, name: 'Sep' },
    { month: 10, name: 'Oct' },
    { month: 11, name: 'Nov' },
    { month: 12, name: 'Dec' }
];

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const getLastSevenMonths = () => {
    const lastSevenMonths = [];
    for (let i = 0; i < 7; i++) {
        const month = (currentMonth - i - 1 + 12) % 12 + 1;
        const year = currentYear - Math.floor((currentMonth - i - 1) / 12);
        lastSevenMonths.push({ month, year });
    }
    return lastSevenMonths.reverse();
};

export const lastSevenMonths = getLastSevenMonths().map(({ month, year }) => ({
    month,
    name: months.find(m => m.month === month).name,
    year
}));


export async function getUSDRated() {
    const url = 'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json';
    const response = await fetch(url);
    const jsonResponse = await response.json();
    return jsonResponse;
}

export const removeFile = (fileName: string) => {
    const filePath = path.join(__dirname, '../uploads', fileName);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error removing file: ${err}`);
        } else {
            console.log(`File removed: ${fileName}`);
        }
    });
};
