"""Quick test for the RegexParser."""

from app.services.parsers.regex_parser import RegexParser
from app.services.parsers.sample_alerts import SAMPLE_ALERTS

parser = RegexParser()

print("=" * 70)
print("TESTING REGEX PARSER")
print("=" * 70)

for alert in SAMPLE_ALERTS:
    result = parser.parse(alert["body"])
    print(f"\n[{alert['bank']}] Alert #{alert['id']}")
    print(f"  Amount:    {result['amount']}")
    print(f"  Account:   {result['account_number']}")
    print(f"  Balance:   {result['balance']}")
    print(f"  Type:      {result['transaction_type']}")
    print(f"  Date:      {result['date']}")