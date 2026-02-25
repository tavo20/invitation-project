import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf

@Component({
  selector: 'app-count-down',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './count-down.component.html',
  styleUrl: './count-down.component.scss'
})
export class CountDownComponent {
 @Input() targetDate!: string; // Input for the target date string (e.g., "October 26, 2025 10:00:00")

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  hasEnded: boolean = false;
  private countdownInterval: any;

  ngOnInit(): void {
    // Ensure targetDate is provided before starting countdown
    if (!this.targetDate) {
      console.error('Target date is not provided for the countdown component.');
      this.hasEnded = true; // Mark as ended if no target date
      return;
    }

    const targetTime = new Date(this.targetDate).getTime();

    // Initial call to update immediately
    this.updateCountdown(targetTime);

    // Set up interval to update every second
    this.countdownInterval = setInterval(() => {
      this.updateCountdown(targetTime);
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed to prevent memory leaks
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
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }

  // Helper function to add leading zero for single-digit numbers
  formatNumber(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}
