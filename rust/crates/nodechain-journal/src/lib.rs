//! NodeChain journal primitives (companion to TS `src/nodechain`).
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

pub const GENESIS_PREV_HASH: &str =
    "0000000000000000000000000000000000000000000000000000000000000000";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct JournalRecord {
    pub height: u64,
    pub record_id: String,
    pub record_type: String,
    pub process_id: Option<String>,
    pub content_hash: String,
    pub prev_hash: String,
    pub envelope_hash: String,
}

pub fn sha256_hex(data: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(data);
    hex::encode(h.finalize())
}

/// Content hash aligned with TS `computeContentHash` (sorted keys):
/// payload, processId, recordType, schemaVersion.
pub fn content_hash(
    schema_version: &str,
    record_type: &str,
    process_id: Option<&str>,
    payload_json: &str,
) -> String {
    let process = process_id
        .map(|p| format!("\"{p}\""))
        .unwrap_or_else(|| "null".into());
    let material = format!(
        "{{\"payload\":{payload_json},\"processId\":{process},\"recordType\":\"{record_type}\",\"schemaVersion\":\"{schema_version}\"}}"
    );
    sha256_hex(material.as_bytes())
}

pub fn verify_link(prev: Option<&JournalRecord>, current: &JournalRecord) -> bool {
    match prev {
        None => current.height == 0 && current.prev_hash == GENESIS_PREV_HASH,
        Some(p) => {
            current.height == p.height + 1 && current.prev_hash == p.envelope_hash
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn genesis_link() {
        let g = JournalRecord {
            height: 0,
            record_id: "g".into(),
            record_type: "genesis".into(),
            process_id: None,
            content_hash: "aa".into(),
            prev_hash: GENESIS_PREV_HASH.into(),
            envelope_hash: "ee".into(),
        };
        assert!(verify_link(None, &g));
    }
}
