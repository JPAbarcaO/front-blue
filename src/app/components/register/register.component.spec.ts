import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'register',
      'isLoggedIn'
    ]);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
    component.registerForm.setValue({
      name: 'Demo',
      email: 'demo@local.com',
      password: '123456',
      confirmPassword: 'different'
    });
    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('navigates after successful register', fakeAsync(() => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.register.and.returnValue(
      of({ success: true, message: 'ok' })
    );

    fixture.detectChanges();
    component.registerForm.setValue({
      name: 'Demo',
      email: 'demo@local.com',
      password: '123456',
      confirmPassword: '123456'
    });
    component.onSubmit();

    expect(component.successMessage).toBe('ok');
    tick(1500);
    expect(router.navigate).toHaveBeenCalledWith(['/gallery']);
  }));

  it('shows error message on failed register', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.register.and.returnValue(
      of({ success: false, message: 'Fail' })
    );

    fixture.detectChanges();
    component.registerForm.setValue({
      name: 'Demo',
      email: 'demo@local.com',
      password: '123456',
      confirmPassword: '123456'
    });
    component.onSubmit();

    expect(component.errorMessage).toBe('Fail');
  });
});
