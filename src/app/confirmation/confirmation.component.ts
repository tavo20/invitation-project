import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from '../shared/services/confirmation.service';


@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  public idSlug: string | null = null;
  public invitation: any = null;
  public invitationSlug: string | null = null;
  public invitationId: string | number | null = null;
  public submitted = false;
  public savedData: any = null;

  public form = this.fb.group({
    guestsCount: [1, [Validators.required, Validators.min(1)]],
    names: ['', [Validators.required, Validators.minLength(2)]],
    comment: ['']
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.idSlug = this.route.snapshot.paramMap.get('id');
    if (!this.idSlug) return;

    const context = this.confirmationService.getInvitationContext(this.idSlug);
    this.invitation = context?.data ?? null;
    this.invitationSlug = context?.slug ?? null;
    this.invitationId = context?.id ?? null;
  }

  get f() {
    return this.form.controls;
  }

  changeGuests(delta: number): void {
    const current = Number(this.form.value.guestsCount ?? 1);
    const next = Math.max(1, current + delta);
    this.form.patchValue({ guestsCount: next });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const response = await this.confirmationService.submitConfirmation({
        invitationId: this.invitationId,
        invitationSlug: this.invitationSlug,
        guestsCount: Number(this.form.value.guestsCount ?? 1),
        names: String(this.form.value.names ?? '').trim(),
        comment: String(this.form.value.comment ?? '').trim()
      });

      if(!response) {
        throw new Error('Failed to save confirmation');
      }

      // this.savedData = response;
      this.submitted = true;
    } catch (error) {
      console.error('Error submitting confirmation', error);
    }
  }

  goBack(): void {
    if (this.invitationSlug) {
      this.router.navigate(['/', this.invitationSlug]);
      return;
    }
    this.router.navigate(['/']);
  }
}
