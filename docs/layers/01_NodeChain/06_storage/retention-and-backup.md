# Retention and backup

## Backup

- Continuous or periodic backup of primary store  
- Encrypt backups  
- Test restore with chain verify  

## Retention

Default product posture: **retain full journal** for audit of rights.  
Legal hold / residency constraints are jurisdiction-specific (owner + counsel).

## Compaction

Internal LSM compaction must not drop user-visible journal heights.  
Cold storage tiering allowed if restore path is defined.
