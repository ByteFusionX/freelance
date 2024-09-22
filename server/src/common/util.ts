import { ObjectId } from "mongodb";
import { Filters } from "../interface/dashboard.interface";

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

        // Handle multiple years
        if (filters.years && filters.years.length > 0) {
            const yearConditions = filters.years.map(year => ({
                createdDate: {
                    $gte: new Date(`${year}-01-01`),
                    $lt: new Date(`${Number(year) + 1}-12-31`)
                }
            }));
            matchFilter['$or'] = yearConditions;
        }

        // Handle multiple months
        if (filters.months && filters.months.length > 0 && filters.years) {
            const monthConditions = filters.months.flatMap(month => {
                return filters.years.map(year => ({
                    createdDate: {
                        $gte: new Date(year, month - 1, 1),
                        $lt: new Date(year, month, 1)
                    }
                }));
            });
            matchFilter['$or'] = matchFilter['$or'] ? [...matchFilter['$or'], ...monthConditions] : monthConditions;
        }

        // Handle multiple salesPersons
        if (filters.salesPersonIds && filters.salesPersonIds.length > 0) {
            matchFilter['salesPerson._id'] = { $in: filters.salesPersonIds.map(id => new ObjectId(id)) };
        }

        // Handle multiple departments
        if (filters.departments && filters.departments.length > 0) {
            matchFilter['department._id'] = { $in: filters.departments };
        }
    }

    return matchFilter;
}


export async function getUSDRated() {
    const url = 'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json';
    const response = await fetch(url);
    const jsonResponse = await response.json();
    return jsonResponse;
} 