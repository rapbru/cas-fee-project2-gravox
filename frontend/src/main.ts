/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LoggerService } from './app/services/logger.service';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => new LoggerService().error(err));