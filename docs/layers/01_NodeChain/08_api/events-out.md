# Events out API

```text
Subscribe(fromHeight?, types[]?) → stream Event
```

Reliable consumers should track last height and resume.  
At-least-once delivery; consumers de-dupe by height/recordId.

See `07_integrity_and_audit/observability-hooks.md` for event kinds.
