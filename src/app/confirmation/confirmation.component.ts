import { Component, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfirmationDocument,
  ConfirmationService
} from '../shared/services/confirmation.service';


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
  public typeConfirmation: string = '';
  public submitted = false;
  public declined = false;
  public isSubmitting = false;
  public isDeclining = false;
  public savedData: any = null;
  public confirmationId: string | null = null;
  public guestInvite: ConfirmationDocument | null = null;
  public loading = true;
  public guestError = '';

  public form = this.fb.group({
    numero_confirmados: [1, [Validators.required, Validators.min(1)]],
    names: ['', [Validators.required, Validators.minLength(2)]],
    comment: ['']
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.idSlug = this.route.snapshot.paramMap.get('id');
    this.confirmationId = this.route.snapshot.paramMap.get('confirmationId');

    if (!this.idSlug) {
      this.loading = false;
      return;
    }

    const context = await this.confirmationService.getInvitationContext(this.idSlug);
    this.invitation = context?.data ?? null;
    this.invitationSlug = context?.slug ?? null;
    this.invitationId = context?.id ?? this.idSlug;
    this.typeConfirmation = this.invitation?.typeConfirmation ?? context?.typeConfirmation ?? '';

    if (this.confirmationId) {
      await this.loadGuestInvite();
    }

    this.loading = false;
  }

  @HostBinding('class.theme-basic')
  get isBasic(): boolean {
    return this.typeConfirmation === 'basic';
  }

  get f() {
    return this.form.controls;
  }

  get maxGuests(): number {
    const allowed = Number(this.guestInvite?.numero_confirmados);
    return allowed > 0 ? allowed : 1;
  }

  get showForm(): boolean {
    return !this.loading && !this.submitted && !!this.invitation && !this.guestError;
  }

  changeGuests(delta: number): void {
    const current = Number(this.form.value.numero_confirmados ?? 1);
    const next = Math.max(1, current + delta);
    this.form.patchValue({
      numero_confirmados: this.guestInvite ? Math.min(this.maxGuests, next) : next
    });
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting || this.isDeclining || this.submitted) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const names = String(this.form.getRawValue().names ?? '').trim();
    const numero_confirmados = Number(this.form.value.numero_confirmados ?? 1);
    const comment = String(this.form.value.comment ?? '').trim();

    if (this.guestInvite && numero_confirmados > this.maxGuests) {
      this.form.controls.numero_confirmados.setErrors({ max: true });
      this.form.controls.numero_confirmados.markAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.confirmationId && this.guestInvite) {
        const response = await this.confirmationService.updateConfirmation(this.confirmationId, {
          names,
          numero_confirmados,
          descripcion: comment,
          status: 'confirmado'
        });

        if (!response) {
          throw new Error('Failed to update confirmation');
        }
      } else {
        const response = await this.confirmationService.submitConfirmation({
          invitationId: this.invitationId,
          invitationSlug: this.invitationSlug,
          numero_confirmados,
          names,
          comment
        });

        if (!response) {
          throw new Error('Failed to save confirmation');
        }
      }

      this.savedData = { names };
      this.submitted = true;
    } catch (error) {
      console.error('Error submitting confirmation', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async onDecline(): Promise<void> {
    if (this.isSubmitting || this.isDeclining || this.submitted || !this.confirmationId || !this.guestInvite) {
      return;
    }

    this.isDeclining = true;

    try {
      const response = await this.confirmationService.updateConfirmation(this.confirmationId, {
        status: 'cancelada'
      });

      if (!response) {
        throw new Error('Failed to decline confirmation');
      }

      this.declined = true;
      this.savedData = { names: this.guestInvite.names };
      this.submitted = true;
    } catch (error) {
      console.error('Error declining confirmation', error);
    } finally {
      this.isDeclining = false;
    }
  }

  goBack(): void {
    if (this.invitationSlug && this.confirmationId) {
      this.router.navigate(['/', this.invitationSlug, this.confirmationId]);
      return;
    }
    if (this.invitationSlug) {
      this.router.navigate(['/', this.invitationSlug]);
      return;
    }
    this.router.navigate(['/']);
  }

  private async loadGuestInvite(): Promise<void> {
    if (!this.idSlug || !this.confirmationId) return;

    try {
      const guestInvite = await this.confirmationService.getConfirmationById(
        this.idSlug,
        this.confirmationId
      );

      if (!guestInvite) {
        this.guestError = 'Este enlace de invitación no es válido.';
        return;
      }

      this.guestInvite = guestInvite;
      this.applyGuestInviteLimits();
    } catch (error) {
      console.error('Error loading guest invitation', error);
      this.guestError = 'No se pudo cargar esta invitación.';
    }
  }

  private applyGuestInviteLimits(): void {
    if (!this.guestInvite) return;

    const maxGuests = this.maxGuests;
    const initialGuests = Math.min(
      Math.max(1, Number(this.guestInvite.numero_confirmados) || 1),
      maxGuests
    );

    this.form.controls.numero_confirmados.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(maxGuests)
    ]);

    this.form.patchValue({
      names: this.guestInvite.names ?? '',
      numero_confirmados: initialGuests,
      comment: this.guestInvite.descripcion ?? ''
    });

    this.form.controls.names.disable({ emitEvent: false });
    this.form.controls.numero_confirmados.updateValueAndValidity();
  }
}
