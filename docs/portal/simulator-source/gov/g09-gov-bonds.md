# Government bond lifecycle

Follow one government bond from confirmed issuance through transfer, coupon and redemption. Both tracks end at maturity.

Reference: Hong Kong’s HKD 800 million tokenised government green bond. HKMA documents issuance, settlement, coupon and redemption. The AST route is an illustrative design and assumes authorised access to issuer and registry confirmations.

## Today

1. Issuance — The issuer establishes the bond terms, nominal amount and maturity.
2. Allocation — The authorised register records the institutional holder’s position.
3. Transfer — After a settled transfer, the register updates the holders’ positions.
4. Coupon — The paying agent uses the applicable record date and confirms the coupon payment.
5. Redemption — Principal is repaid at maturity. The register records redemption and closes the position.

## With AST

1. Confirmed asset — The issuer provides evidence of the institutional bond, its terms, valuation and authoritative record.
2. Tokenisation — AST records the confirmed asset in NodeChain and issues ArosCoin according to the agreed equivalent. The tokenised position refers to this bond.
3. Transfer — AST services the asset and records the confirmed change in the holder’s position, preserving the link to the underlying bond.
4. Coupon — The paying agent confirms the coupon event. AST links that event to the serviced asset and the relevant position.
5. Redemption — After confirmed repayment at maturity, AST records the terminal event and ends servicing for the redeemed asset.
