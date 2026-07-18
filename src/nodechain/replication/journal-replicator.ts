import type { JournalRecord, Tip } from '../types';
import type { JournalStore } from '../store.interface';
import type { NodechainService } from '../nodechain.service';
import { verifyChainLink } from '../hash';
import { GENESIS_PREV_HASH } from '../types';

export interface PeerJournalView {
  getTip(): Promise<Tip | null>;
  getByHeight(height: number): Promise<JournalRecord | null>;
  /** Inclusive fromHeight → tip, ordered by height. */
  listFrom(fromHeight: number, limit?: number): Promise<JournalRecord[]>;
}

export type TipRelation = 'equal' | 'local_ahead' | 'peer_ahead' | 'diverge' | 'empty';

export interface CatchUpResult {
  applied: number;
  skipped: number;
  relation: TipRelation;
  localTip: Tip | null;
  peerTip: Tip | null;
  error?: string;
}

/**
 * Journal catch-up for multi-node (issue #69).
 * Extends local chain only when peer segment links to local tip.
 * Divergent tips → fail-closed (no silent fork merge).
 */
export class JournalReplicator {
  constructor(
    private readonly store: JournalStore,
    private readonly nodechain?: NodechainService,
  ) {}

  /** Wrap a local store as peer view. */
  static asPeer(store: JournalStore): PeerJournalView {
    return {
      getTip: () => store.getTip(),
      getByHeight: (h) => store.getByHeight(h),
      listFrom: async (fromHeight, limit = 10_000) => {
        const all = await store.listAll();
        return all.filter((r) => r.height >= fromHeight).slice(0, limit);
      },
    };
  }

  async compareTips(peer: PeerJournalView): Promise<TipRelation> {
    const local = await this.store.getTip();
    const remote = await peer.getTip();
    if (!local && !remote) return 'empty';
    if (!local && remote) return 'peer_ahead';
    if (local && !remote) return 'local_ahead';
    if (local!.height === remote!.height) {
      return local!.tipHash === remote!.tipHash ? 'equal' : 'diverge';
    }
    if (local!.height > remote!.height) {
      const atPeer = await this.store.getByHeight(remote!.height);
      if (!atPeer || atPeer.envelopeHash !== remote!.tipHash) return 'diverge';
      return 'local_ahead';
    }
    // peer taller — check our tip matches peer's record at our height
    const peerAtLocal = await peer.getByHeight(local!.height);
    if (!peerAtLocal || peerAtLocal.envelopeHash !== local!.tipHash) return 'diverge';
    return 'peer_ahead';
  }

  /**
   * Pull missing heights from peer and append if chain-linked.
   * Does not re-sign: adopts peer record bytes as authoritative segment.
   */
  async catchUpFrom(peer: PeerJournalView, opts?: { maxBatch?: number }): Promise<CatchUpResult> {
    const maxBatch = opts?.maxBatch ?? 10_000;
    const relation = await this.compareTips(peer);
    const localTip = await this.store.getTip();
    const peerTip = await peer.getTip();

    if (relation === 'equal' || relation === 'local_ahead' || relation === 'empty') {
      return { applied: 0, skipped: 0, relation, localTip, peerTip };
    }
    if (relation === 'diverge') {
      return {
        applied: 0,
        skipped: 0,
        relation: 'diverge',
        localTip,
        peerTip,
        error: 'divergent tips — refuse catch-up (partition safety)',
      };
    }

    // peer_ahead
    const from = localTip ? localTip.height + 1 : 0;
    const segment = await peer.listFrom(from, maxBatch);
    let applied = 0;
    let skipped = 0;
    let prev: JournalRecord | null = localTip
      ? await this.store.getByHeight(localTip.height)
      : null;

    for (const rec of segment) {
      if (!(await this.store.getByHeight(rec.height))) {
        // validate link
        if (!verifyChainLink(prev, rec, GENESIS_PREV_HASH)) {
          return {
            applied,
            skipped,
            relation: 'diverge',
            localTip: await this.store.getTip(),
            peerTip,
            error: `chain break at peer height ${rec.height}`,
          };
        }
        // Prefer NodechainService path if available for verifyEveryN; else raw durable
        if (this.nodechain) {
          // Direct durable append of already-signed peer record
          await this.store.appendDurable(rec, `replicate:${rec.recordId}`);
        } else {
          await this.store.appendDurable(rec, `replicate:${rec.recordId}`);
        }
        applied += 1;
        prev = rec;
      } else {
        skipped += 1;
        prev = rec;
      }
    }

    return {
      applied,
      skipped,
      relation: 'peer_ahead',
      localTip: await this.store.getTip(),
      peerTip,
    };
  }
}
