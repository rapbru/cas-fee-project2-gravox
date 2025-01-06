import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PositionOrderService } from './position-order.service';
import { ErrorHandlingService } from './error-handling.service';
import { ApiConfigService } from './api-config.service';
import { Position } from '../models/position.model';
import { PositionOrder } from '../models/position-order.model';
import { provideHttpClient } from '@angular/common/http';

describe('PositionOrderService', () => {
  let service: PositionOrderService;
  let httpMock: HttpTestingController;
  let errorHandlingServiceSpy: jasmine.SpyObj<ErrorHandlingService>;

  const mockApiUrl = 'http://mock-api/settings/position-order';

  // Mock-Positionen
  const mockPositions: Position[] = [
    {
      id: 1,
      number: 101,
      name: 'Position 1',
      time: { actual: 10, preset: 20 },
      temperature: { actual: 50, preset: 60, isPresent: true },
      current: { actual: 5, preset: 10, isPresent: true },
      voltage: { actual: 220, preset: 230, isPresent: true },
    },
    {
      id: 2,
      number: 102,
      name: 'Position 2',
      time: { actual: 15, preset: 25 },
      temperature: { actual: 55, preset: 65, isPresent: true },
      current: { actual: 6, preset: 11, isPresent: true },
      voltage: { actual: 221, preset: 231, isPresent: true },
    },
    {
      id: 3,
      number: 103,
      name: 'Position 3',
      time: { actual: 12, preset: 22 },
      temperature: { actual: 52, preset: 62, isPresent: false },
      current: { actual: 7, preset: 12, isPresent: true },
      voltage: { actual: 222, preset: 232, isPresent: true },
    },
  ];

  // Mock-Position-Order
  const mockPositionOrder: PositionOrder[] = [
    { position_id: 2, order_index: 1 },
    { position_id: 1, order_index: 2 },
  ];

  beforeEach(async () => {
    const errorHandlingMock = jasmine.createSpyObj('ErrorHandlingService', ['showSuccess', 'showError']);
    const apiConfigMock = jasmine.createSpyObj('ApiConfigService', ['getUrl']);
    apiConfigMock.getUrl.and.returnValue(mockApiUrl);

    await TestBed.configureTestingModule({

      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PositionOrderService,
        { provide: ErrorHandlingService, useValue: errorHandlingMock },
        { provide: ApiConfigService, useValue: apiConfigMock },
      ],
    }).compileComponents();

    service = TestBed.inject(PositionOrderService);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandlingServiceSpy = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch position order', () => {
    service.getPositionOrder().subscribe((result) => {
      expect(result).toEqual(mockPositionOrder);
    });

    const req = httpMock.expectOne(mockApiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockPositionOrder);
  });

  it('should save position order and show success message', () => {
    const mockPositionIds = mockPositions.map((pos) => pos.id);

    service.savePositionOrder(mockPositionIds).subscribe(() => {
      expect(errorHandlingServiceSpy.showSuccess).toHaveBeenCalledWith('Reihenfolge gespeichert');
    });

    const req = httpMock.expectOne(mockApiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ positions: mockPositionIds });
    req.flush(null);
  });

  it('should show error message when saving position order fails', () => {
    const mockPositionIds = mockPositions.map((pos) => pos.id);
    const mockError = new ProgressEvent('Network error');

    service.savePositionOrder(mockPositionIds).subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error).toBeTruthy();
        expect(errorHandlingServiceSpy.showError).toHaveBeenCalledWith('Fehler beim Speichern der Reihenfolge');
      },
    });

    const req = httpMock.expectOne(mockApiUrl);
    req.error(mockError);
  });

  it('should apply position order correctly', () => {
    service.applyOrder(mockPositions).subscribe((result) => {
      expect(result).toEqual([
        {
          id: 2,
          number: 102,
          name: 'Position 2',
          time: { actual: 15, preset: 25 },
          temperature: { actual: 55, preset: 65, isPresent: true },
          current: { actual: 6, preset: 11, isPresent: true },
          voltage: { actual: 221, preset: 231, isPresent: true },
        },
        {
          id: 1,
          number: 101,
          name: 'Position 1',
          time: { actual: 10, preset: 20 },
          temperature: { actual: 50, preset: 60, isPresent: true },
          current: { actual: 5, preset: 10, isPresent: true },
          voltage: { actual: 220, preset: 230, isPresent: true },
        },
        {
          id: 3,
          number: 103,
          name: 'Position 3',
          time: { actual: 12, preset: 22 },
          temperature: { actual: 52, preset: 62, isPresent: false },
          current: { actual: 7, preset: 12, isPresent: true },
          voltage: { actual: 222, preset: 232, isPresent: true },
        },
      ]);
    });

    const req = httpMock.expectOne(mockApiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockPositionOrder);
  });
});
