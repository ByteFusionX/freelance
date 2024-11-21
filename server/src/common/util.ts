import { ObjectId } from "mongodb";
import { Filters } from "../interface/dashboard.interface";
import fs from 'fs';
import path from 'path';
import axios from "axios";
import employeeModel from "../models/employee.model";


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

export const buildDashboardFilters = (filters: Filters, accessFilter: any) => {
    const matchFilter: any = {};

    if (filters) {

        if (filters.fromDate && filters.toDate) {
            const startDate = new Date(filters.fromDate);
            const endDate = new Date(filters.toDate);
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            
            matchFilter['createdDate'] = {
                $gte: startDate,
                $lt: endDate
            };

        } else if (filters.fromDate) {
            matchFilter['createdDate'] = { $gte: new Date(filters.fromDate) };
        } else if (filters.toDate) {
            const endDate = new Date(filters.toDate);
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            matchFilter['createdDate'] = { $lt: endDate };
        }

        // Handle multiple salesPersons
        if (filters.salesPersonIds && filters.salesPersonIds.length > 0 && !accessFilter['salesPerson._id']) {
            matchFilter['salesPerson._id'] = { $in: filters.salesPersonIds.map(id => new ObjectId(id)) };
        } else if (filters.salesPersonIds && filters.salesPersonIds.length > 0 && accessFilter['salesPerson._id']) {
            accessFilter['salesPerson._id'] = ''
        }

        // Handle multiple departments
        if (filters.departments && filters.departments.length > 0) {
            matchFilter['department._id'] = { $in: filters.departments.map(depId => new ObjectId(depId)) };
        }
    }

    return { ...accessFilter, ...matchFilter };
}


export const getDateRange = (fromDate: string, toDate: string) => {
    let gte: Date, lte: string | number | Date;

    const currentDate = new Date();
    console.log(fromDate, toDate);

    if (!toDate && !fromDate) {
        gte = new Date(currentDate);
        gte.setFullYear(currentDate.getFullYear() - 1);
        lte = currentDate;
    } else if (!fromDate && toDate) {
        lte = new Date(toDate);
        gte = new Date(lte);
        gte.setFullYear(lte.getFullYear() - 1);
    } else if (fromDate && !toDate) {
        gte = new Date(fromDate);
        lte = currentDate;
    } else if (fromDate && toDate) {

        gte = new Date(fromDate);
        lte = new Date(toDate);
    }

    return { gte, lte };
}

export const calculateDiscountPricePipe = (input: string, discount: string) => {
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

const getLastCountedMonths = (monthCount: number, currentMonth: number, currentYear: number) => {
    const lastMonths = [];
    for (let i = 0; i < monthCount; i++) {
        const month = (currentMonth - i - 1 + 12) % 12 + 1;
        const year = currentYear - Math.floor((currentMonth - i - 1) / 12);
        lastMonths.push({ month, year });
    }
    return lastMonths.reverse();
};

export const lastRangedMonths = (dateRange: any) => {
    const start = new Date(dateRange.gte);
    const end = new Date(dateRange.lte);

    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();

    // Calculate the total number of months in the range
    const monthsCount = (yearsDifference * 12) + monthsDifference + 1; // Add 1 to include the start month

    const currentMonth = end.getMonth() + 1; // getMonth() is 0-indexed, so add 1
    const currentYear = end.getFullYear();

    return getLastCountedMonths(monthsCount, currentMonth, currentYear).map(({ month, year }) => ({
        month,
        name: months.find(m => m.month === month)?.name || "Unknown",
        year
    }));
}


export async function getUSDRated() {
    let rate = getCachedRate();

    if (!rate) {
        rate = await fetchExchangeRate();
    } else {
        console.log('Using cached exchange rate:', rate);
    }

    return rate;
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

const CACHE_FILE = path.join(__dirname, 'exchangeRate.json');
const API_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json'; // Replace with your actual API endpoint

export async function fetchExchangeRate() {
    try {
        const response = await axios.get(API_URL);
        const rate = response.data.usd.qar;
        cacheExchangeRate(rate);
        return rate;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return null;
    }
}

function cacheExchangeRate(rate) {
    const data = { rate, timestamp: Date.now() };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
}

function getCachedRate() {
    if (fs.existsSync(CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        return data.rate;
    }
    return null;
}

export const getAllReportedEmployees = async (userId: any): Promise<ObjectId[]> => {
    try {
        // Step 1: Fetch all employees and their reportingTo relationships in one go
        const employees = await employeeModel.find({}, '_id reportingTo').lean();
        
        // Step 2: Build a lookup map for quick access
        const employeeMap = new Map<string, string[]>(); // key: managerId, value: list of employeeIds
        for (const employee of employees) {
            const managerId = employee.reportingTo?.toString(); // Use `null` or empty string if no manager
            if (!employeeMap.has(managerId)) {
                employeeMap.set(managerId, []);
            }
            employeeMap.get(managerId)!.push(employee._id.toString());
        }

        // Step 3: Perform a breadth-first search (BFS) to collect all reported employees
        const visited = new Set<string>();
        const queue = [userId.toString()]; // Start with the provided userId
        const reportedIds: ObjectId[] = [];

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;

            visited.add(currentId);
            const directReports = employeeMap.get(currentId) || [];
            reportedIds.push(...directReports.map(id => new ObjectId(id)));
            queue.push(...directReports); // Enqueue for further processing
        }

        return reportedIds;
    } catch (error) {
        console.error('Error fetching reported employees:', error);
        return [];
    }
};