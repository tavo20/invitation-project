import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-azul-gris-colores-count-down',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './azul-gris-colores-count-down.component.html',
  styleUrl: './azul-gris-colores-count-down.component.scss'
})
export class AzulGrisColoresCountDownComponent implements OnInit, OnDestroy {
  @Input() targetDate!: string;

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  hasEnded: boolean = false;
  private countdownInterval: any;

  ngOnInit(): void {
    if (!this.targetDate) {
      console.error('Target date is not provided for the countdown component.');
      this.hasEnded = true;
      return;
    }

    const targetTime = new Date(this.targetDate).getTime();

    this.updateCountdown(targetTime);

    this.countdownInterval = setInterval(() => {
      this.updateCountdown(targetTime);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private updateCountdown(targetTime: number): void {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance < 0) {
      this.hasEnded = true;
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
      return;
    }

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }

  formatNumber(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}
