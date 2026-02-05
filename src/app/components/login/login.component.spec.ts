import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
      'isLoggedIn'
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('redirects to gallery if already logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/gallery']);
  });

  it('does not submit when form is invalid', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('navigates on successful login', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.login.and.returnValue(of({ success: true, message: 'ok' }));

    fixture.detectChanges();
    component.loginForm.setValue({
      email: 'demo@local.com',
      password: '123456'
    });
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/gallery']);
    expect(component.errorMessage).toBe('');
  });

  it('shows error message on failed login', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.login.and.returnValue(
      of({ success: false, message: 'Invalid' })
    );

    fixture.detectChanges();
    component.loginForm.setValue({
      email: 'demo@local.com',
      password: 'wrong'
    });
    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid');
  });
});
