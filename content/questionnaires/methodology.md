# Draft financial methodology

**Version:** `2026-07-draft.1`  
**Status:** Draft — blocked from real-user production use until signed off by a qualified financial reviewer and compliance counsel.

The health score combines seven explainable dimensions:

- Monthly cash flow: 25%
- High-cost debt and debt-payment pressure: 20%
- Emergency-fund coverage: 20%
- Savings consistency: 10%
- Protection awareness: 10%
- Goal readiness: 10%
- Financial knowledge: 5%

Risk willingness is calculated from direct scenario questions. Risk capacity is
calculated separately from income stability, emergency savings, debt pressure,
dependants, investment horizon, and liquidity needs. The combined educational
risk class uses the more conservative of willingness and capacity.

The roadmap follows this priority:

1. Stabilize negative cash flow.
2. Reduce reported high-cost debt.
3. Build a starter liquid buffer.
4. Build a safety fund.
5. Learn protection fundamentals.
6. Define goals.
7. Learn investment categories.

Every result stores the profile snapshot ID, rule-set version, explanation,
warnings, and creation time. Changes require a new rule-set version and a
comparison against all worked personas.
