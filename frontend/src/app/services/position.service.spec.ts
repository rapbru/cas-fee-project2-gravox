import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PositionService } from './position.service';
import { ErrorHandlingService } from './error-handling.service';
import { ApiConfigService } from './api-config.service';
import { OverviewStateService } from './overview-state.service';
import { ColumnManagementService } from './column-management.service';
import { PositionOrderService } from './position-order.service';
import { Position } from '../models/position.model';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

describe('PositionService', () => {
  let service: PositionService;
  let httpMock: HttpTestingController;
  let errorHandlingServiceSpy: jasmine.SpyObj<ErrorHandlingService>;
  let columnManagementServiceSpy: jasmine.SpyObj<ColumnManagementService>;
  let positionOrderServiceSpy: jasmine.SpyObj<PositionOrderService>;

  const mockApiUrl = 'http://mock-api/positions';

  const mockPosition: Position = {
    id: 1,
    number: 101,
    name: 'Test Position',
    flightbar: 0,
    articleName: 'Test Artikel',
    customerName: 'Test Kunde',
    time: { actual: 10, preset: 20 },
    temperature: { actual: 50, preset: 60, isPresent: true },
    current: { actual: 5, preset: 10, isPresent: true },
    voltage: { actual: 220, preset: 230, isPresent: true }
  };

  // Server-Response mit Sekunden
  const mockServerResponse = {
    ...mockPosition,
    time: {
      actual: 600, // 10 Minuten in Sekunden
      preset: 1200 // 20 Minuten in Sekunden
    }
  };

  const mockNewPosition: Position = {
    ...mockPosition,
    id: -1,
    name: 'Neue Position'
  };

  beforeEach(async () => {
    const errorHandlingMock = jasmine.createSpyObj('ErrorHandlingService', ['showSuccess', 'showError']);
    const apiConfigMock = jasmine.createSpyObj('ApiConfigService', ['getUrl']);
    const overviewStateMock = jasmine.createSpyObj('OverviewStateService', [''], {
      selectedPosition: { value: null }
    });
    const columnManagementMock = jasmine.createSpyObj('ColumnManagementService', ['saveColumnSettings']);
    const positionOrderMock = jasmine.createSpyObj('PositionOrderService', ['savePositionOrder']);

    apiConfigMock.getUrl.and.returnValue(mockApiUrl);
    columnManagementMock.saveColumnSettings.and.returnValue(of(null));
    positionOrderMock.savePositionOrder.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      providers: [
        PositionService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorHandlingService, useValue: errorHandlingMock },
        { provide: ApiConfigService, useValue: apiConfigMock },
        { provide: OverviewStateService, useValue: overviewStateMock },
        { provide: ColumnManagementService, useValue: columnManagementMock },
        { provide: PositionOrderService, useValue: positionOrderMock }
      ]
    }).compileComponents();

    service = TestBed.inject(PositionService);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandlingServiceSpy = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;
    columnManagementServiceSpy = TestBed.inject(ColumnManagementService) as jasmine.SpyObj<ColumnManagementService>;
    positionOrderServiceSpy = TestBed.inject(PositionOrderService) as jasmine.SpyObj<PositionOrderService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new position and transform time values', () => {
    service.createPosition(mockPosition).subscribe(result => {
      expect(result).toEqual(mockPosition);
      expect(errorHandlingServiceSpy.showSuccess).toHaveBeenCalledWith('Position erfolgreich erstellt');
    });

    const req = httpMock.expectOne(mockApiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockServerResponse);
  });

  it('should handle error when creating position fails', () => {
    const mockError = new ProgressEvent('Network error');

    service.createPosition(mockPosition).subscribe({
      error: () => {
        expect(errorHandlingServiceSpy.showError).toHaveBeenCalledWith('Fehler beim Erstellen der Position');
      }
    });

    const req = httpMock.expectOne(mockApiUrl);
    req.error(mockError);
  });

  describe('saveAllChanges', () => {
    it('should save new positions first', (done) => {
      // Setze eine neue Position in den editPositions-Signal
      service.editPositions.set([mockNewPosition]);

      // Mock die fetchPositions-Methode
      spyOn(service, 'fetchPositions');

      service.saveAllChanges();

      // Erwarte POST-Request für neue Position
      const req = httpMock.expectOne(mockApiUrl);
      expect(req.request.method).toBe('POST');
      req.flush({ ...mockNewPosition, id: 100 }); // Simuliere Server-Response mit neuer ID

      // Warte auf asynchrone Operationen
      setTimeout(() => {
        // Überprüfe, ob die Spalteneinstellungen gespeichert wurden
        expect(columnManagementServiceSpy.saveColumnSettings).toHaveBeenCalled();

        // Überprüfe, ob die Positionsreihenfolge gespeichert wurde
        expect(positionOrderServiceSpy.savePositionOrder).toHaveBeenCalled();

        // Überprüfe Erfolgsmeldung
        expect(errorHandlingServiceSpy.showSuccess).toHaveBeenCalledWith('Alle Änderungen erfolgreich gespeichert');

        // Überprüfe, ob fetchPositions aufgerufen wurde
        expect(service.fetchPositions).toHaveBeenCalled();

        done();
      });
    });

    it('should handle errors when saving new positions', () => {
      service.editPositions.set([mockNewPosition]);

      // Mock die fetchPositions-Methode
      spyOn(service, 'fetchPositions');

      service.saveAllChanges();

      const req = httpMock.expectOne(mockApiUrl);
      req.error(new ErrorEvent('Network error'));

      expect(errorHandlingServiceSpy.showError).toHaveBeenCalledWith(
        'Fehler beim Speichern der neuen Positionen',
        jasmine.any(HttpErrorResponse)
      );
    });

    it('should save position order and column settings when no new positions exist', () => {
      // Setze eine existierende Position in den editPositions-Signal
      service.editPositions.set([mockPosition]);

      // Mock die fetchPositions-Methode
      spyOn(service, 'fetchPositions');

      service.saveAllChanges();

      // Überprüfe, ob die Spalteneinstellungen gespeichert wurden
      expect(columnManagementServiceSpy.saveColumnSettings).toHaveBeenCalled();

      // Überprüfe, ob die Positionsreihenfolge gespeichert wurde
      expect(positionOrderServiceSpy.savePositionOrder).toHaveBeenCalledWith([mockPosition.id]);

      // Überprüfe, ob fetchPositions aufgerufen wurde
      expect(service.fetchPositions).toHaveBeenCalled();
    });
  });
}); 