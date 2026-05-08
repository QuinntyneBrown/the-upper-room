// traces_to: L2-068
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TarEmptyState } from 'components';

@Component({
  selector: 'app-forbidden',
  imports: [TarEmptyState, RouterLink],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.scss',
})
export class Forbidden {}
