import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component'; // Import OverviewComponent
// import { SharedModule } from '../shared/shared.module'; // Adjust the path as necessary

@NgModule({
  declarations: [
    OverviewComponent // Declare the OverviewComponent here
  ],
  imports: [
    CommonModule
    // SharedModule // Import the SharedModule to use directives like appButtonStyle
  ]
})
export class OverviewModule {}
