//! PoT criteria types (companion to TS `src/pot`).
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct CriteriaResult {
    pub p1: bool,
    pub p2: bool,
    pub p3: bool,
    pub p4: bool,
}

impl CriteriaResult {
    pub fn all_pass(&self) -> bool {
        self.p1 && self.p2 && self.p3 && self.p4
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PotVerdict {
    pub process_id: String,
    /// 0 | 1
    pub verified: u8,
    pub reason_codes: Vec<String>,
    pub criteria: CriteriaResult,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_pass() {
        let c = CriteriaResult {
            p1: true,
            p2: true,
            p3: true,
            p4: true,
        };
        assert!(c.all_pass());
    }
}
