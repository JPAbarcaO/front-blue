import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('login should call backend and store auth data', (done) => {
    service.login('demo@local.com', '123456').subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.token).toBe('jwt-token');
      expect(service.getToken()).toBe('jwt-token');
      expect(service.getCurrentUser()?.email).toBe('demo@local.com');
      expect(service.isLoggedIn()).toBeTrue();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'demo@local.com',
      password: '123456'
    });
    req.flush({
      token: 'jwt-token',
      user: { email: 'demo@local.com', name: 'Demo' }
    });
  });

  it('register should surface backend error message', (done) => {
    service.register('demo@local.com', 'Demo', '123456').subscribe((response) => {
      expect(response.success).toBeFalse();
      expect(response.message).toBe('Nope');
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(
      { message: 'Nope' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('logout should clear user and token', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com', name: 'A' }));

    expect(service.getToken()).toBe('t');
    service.logout();

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
