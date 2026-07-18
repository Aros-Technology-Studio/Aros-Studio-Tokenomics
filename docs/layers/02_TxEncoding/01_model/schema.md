# Schemas

| processType | required fields |
|-------------|-----------------|
| primary_tokenization | institutionId, valuation, holderId |
| revaluation | institutionId, assetId, previousValue, newValue |
| ownership_transfer | institutionId, assetId, fromHolderId, toHolderId, amount |

Extra keys: **rejected**.  
Amounts: decimal string, optional fraction up to 9 digits.  
Hashes: 64 hex chars.
