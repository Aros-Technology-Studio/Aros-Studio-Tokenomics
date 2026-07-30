# Acceptance — Asset tokenization

**Status (C4):** v1 **pilot path Done** (intake + pipeline + PoT-gated economic hand-off).

- [x] Primary e2e mint + commission + reserve  
- [x] Document package hash  
- [x] Asset registry  
- [x] Revaluation process  
- [x] Ownership transfer process  
- [x] Index mirror replay after success  
- [x] Tests  

```bash
npm test -- --testPathPattern='token|intake'
```

## Residual (honest — portal/ops, not core layer holes)

- [x] X.509 detached certificate chain verify at portal edge (D4 pilot crypto; national QTSP residual)  
- [ ] Full national QES / QTSP profile (eIDAS etc.) + OCSP/CRL (residual)  
- [ ] OCR for image-only scans  
- [ ] Production mTLS / OIDC for institutions  
- [ ] Operator e2e checklist sign-off with real PDF package (C5 / owner)  
