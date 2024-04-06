import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { login } from 'src/app/shared/interfaces/login';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  submit: boolean = false
  employeeNotFoundError: boolean = false
  passwordNotMatchError: boolean = false
  isSaving: boolean = false;

  showPassword: boolean = false;
  passwordType: string = this.showPassword ? 'text' : 'password';
  showIcon: string = this.showPassword ? 'heroEye' : 'heroEyeSlash';

  constructor(
    private employeeService: EmployeeService,
    private _fb: FormBuilder,
    private router: Router) { }

  loginForm = this._fb.group({
    employeeId: ['', Validators.required],
    password: ['', Validators.required]
  })

  passwordShow() {
    this.showPassword = !this.showPassword
    this.passwordType = this.showPassword ? 'text' : 'password';
    this.showIcon = this.showPassword ? 'heroEye' : 'heroEyeSlash';
  }

  onSubmit() {
    this.submit = true
    if (this.loginForm.valid) {
      this.isSaving = true;
      this.employeeService.employeeLogin(this.loginForm.value).subscribe((res: login) => {
        if (res.employeeData && res.token) {
          localStorage.setItem('employeeToken', res.token)
          this.router.navigate(['/home'])
        }
        else if (res.employeeNotFoundError) {
          this.isSaving = false;
          this.employeeNotFoundError = true;

        } else if (res.passwordNotMatchError) {
          this.isSaving = false;
          this.passwordNotMatchError = true
        }
      })
    }
  }
}
