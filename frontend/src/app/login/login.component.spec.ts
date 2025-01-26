import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../authentication/auth.service';
import { LoginComponent } from './login.component';
import { signal } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['login', 'saveToken'], {
      isLoggedIn: signal(false)
    });
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty username and password', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
  });

  it('should display an error message on login failure', () => {
    const errorMessage = 'Invalid username or password';
    authServiceSpy.login.and.returnValue(throwError(() => new Error(errorMessage)));

    component.username = 'wrong-user';
    component.password = 'wrong-password';
    component.login();

    expect(component.errorMessage).toBe(errorMessage);
    expect(authServiceSpy.login).toHaveBeenCalledWith('wrong-user', 'wrong-password');
  });

  it('should navigate to overview on successful login', () => {
    const mockToken = 'test-token';
    authServiceSpy.login.and.returnValue(of({ token: mockToken }));

    component.username = 'correct-user';
    component.password = 'correct-password';
    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledWith('correct-user', 'correct-password');
    expect(authServiceSpy.saveToken).toHaveBeenCalledWith(mockToken);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/overview']);
    expect(component.errorMessage).toBeNull();
  });

  it('should display validation error if form is invalid', () => {
	const errorMessage = 'Invalid username or password';
    component.username = '';
    component.password = '';
    const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');

    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage).toBe(errorMessage);
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});
