import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { INVARIANT_BROKEN_EVENT } from '../invariants/invariants.service';

export type AlertSeverity = 'critical' | 'info';

export interface EyeAlert {
  alertId: string;
  severity: AlertSeverity;
  reasonCode: string;
  message: string;
  at: string;
  payload?: unknown;
}

export interface EyeObservation {
  observationId: string;
  eventType: string;
  at: string;
  payload?: unknown;
}

/**
 * Observe + notify only. No veto, rollback, mint, burn, pay (CANON §4.3).
 * Separate-process deployment is ops concern; logic is this service.
 */
@Injectable()
export class AllSeeingEyeService {
  private readonly observations: EyeObservation[] = [];
  private readonly alerts: EyeAlert[] = [];
  private readonly analyticMirror: EyeObservation[] = [];
  private enabled = true;

  /** Dev/test only — never disable in prod (enforced by ops config). */
  setEnabled(enabled: boolean, env: string): void {
    if (env === 'prod' && !enabled) {
      throw new Error('Eye cannot be disabled in prod');
    }
    this.enabled = enabled;
  }

  observe(eventType: string, payload?: unknown): void {
    if (!this.enabled) return;
    const obs: EyeObservation = {
      observationId: `obs-${Date.now()}-${this.observations.length}`,
      eventType,
      at: new Date().toISOString(),
      payload,
    };
    this.observations.push(obs);
    this.analyticMirror.push(obs);
  }

  notify(severity: AlertSeverity, reasonCode: string, message: string, payload?: unknown): EyeAlert {
    const alert: EyeAlert = {
      alertId: `alert-${Date.now()}-${this.alerts.length}`,
      severity,
      reasonCode,
      message,
      at: new Date().toISOString(),
      payload,
    };
    if (this.enabled) {
      this.alerts.push(alert);
      this.observe(`alert:${severity}`, alert);
    }
    return alert;
  }

  @OnEvent(INVARIANT_BROKEN_EVENT)
  onInvariantBroken(payload: unknown): void {
    this.notify('critical', 'E_INVARIANT_BROKEN', 'Invariant broken observed', payload);
  }

  listAlerts(): readonly EyeAlert[] {
    return this.alerts;
  }

  listObservations(): readonly EyeObservation[] {
    return this.observations;
  }

  mirrorLagHintMs(): number {
    // Max lag target 30s (CANON §XII); mirror is sync in-process for v1 skeleton.
    return 0;
  }
}
