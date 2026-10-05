"""Test for the Hybrid Regex-NER parser."""

from app.services.parsers.hybrid_parser import HybridParser
from app.services.parsers.sample_alerts import SAMPLE_ALERTS

parser = HybridParser()

print("=" * 80)
print("TESTING HYBRID REGEX-NER PARSER")
print("=" * 80)

for alert in SAMPLE_ALERTS:
    result = parser.parse(alert["body"])
    print(f"\n[{alert['bank']}] Alert #{alert['id']}")
    print(f"  Amount:       ₦{result['amount']:,.2f}" if result['amount'] else "  Amount:       —")
    print(f"  Type:         {result['transaction_type'] or '—'}")
    print(f"  Date:         {result['date'] or '—'}")
    print(f"  Account:      {result['account_number'] or '—'}")
    print(f"  Balance:      ₦{result['balance']:,.2f}" if result['balance'] else "  Balance:      —")
    print(f"  Merchant:     {result['merchant'] or '—'}")
    print(f"  Confidence:   {result['confidence'] * 100:.1f}%")

print("\n" + "=" * 80)