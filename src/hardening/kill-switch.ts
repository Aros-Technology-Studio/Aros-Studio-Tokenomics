/**
 * Global kill-switch: forces journal / pipeline into read-only fail-closed mode.
 */
export class KillSwitch {
  private engaged = false;
  private reason: string | null = null;

  engage(reason: string): void {
    this.engaged = true;
    this.reason = reason;
  }

  release(): void {
    this.engaged = false;
    this.reason = null;
  }

  isEngaged(): boolean {
    return this.engaged;
  }

  getReason(): string | null {
    return this.reason;
  }

  assertWritable(): void {
    if (this.engaged) {
      throw new Error(`KILL_SWITCH: ${this.reason ?? 'read-only'}`);
    }
  }
}

export const globalKillSwitch = new KillSwitch();
