// traces_to: L2-069
import { Component, inject, OnInit } from '@angular/core';
import { ErrorBoundaryService } from '../error-boundary.service';

@Component({
  selector: 'app-throw',
  template: ``,
})
export class Throw implements OnInit {
  private readonly boundary = inject(ErrorBoundaryService);

  ngOnInit(): void {
    this.boundary.raise();
    throw new Error('test-only deliberate render error');
  }
}
