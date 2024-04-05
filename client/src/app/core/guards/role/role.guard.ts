import { inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivateFn, NavigationStart, Router, RouterStateSnapshot } from '@angular/router';
import { EmployeeService } from '../../services/employee/employee.service';
import { Observable, filter, map, take } from 'rxjs';
import { Privileges, getEmployee } from 'src/app/shared/interfaces/employee.interface';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let privileges: Privileges | undefined;

    const router: Router = inject(Router);

    const employeeService = inject(EmployeeService)


    const employee = employeeService.employeeToken()
    const employeeId = employee.employeeId
    return employeeService.getEmployee(employeeId).pipe(
        map((data) => {
            employeeService.employeeSubject.next(data);
            privileges = data?.category.privileges;
            return checkPermission()
        })
    );

    function checkPermission() {
        const url = state.url;

        switch (url) {
            case '/home/employees':
                if (privileges?.employee?.viewReport == 'none') {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/home/announcements':
                if (privileges?.announcement?.viewReport == 'none') {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/customers':
                if (privileges?.customer?.viewReport == 'none') {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/customers/create':
                if (!privileges?.customer?.create) {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/enquiry':
                if (privileges?.enquiry?.viewReport == 'none') {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/assigned-jobs':
                if (privileges?.assignedJob?.viewReport == 'none') {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/quotations':
                if (privileges?.quotation?.viewReport == 'none') {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/quotations/create':
                if (!privileges?.quotation?.create) {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            case '/job-sheet':
                if (privileges?.jobSheet?.viewReport == 'none') {
                    router.navigate(['/home']);
                    return false;
                }
                break;

            default:
                break;
        }
        if (!privileges) {
            // router.navigate(['/home']);
            return false;
        }
        return true;
    }

};
