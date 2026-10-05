"""Quick test for the NERParser."""

from app.services.parsers.ner_parser import NERParser
from app.services.parsers.sample_alerts import SAMPLE_ALERTS

parser = NERParser()

print("=" * 70)
print("TESTING NER PARSER")
print("=" * 70)

for alert in SAMPLE_ALERTS:
    result = parser.parse(alert["body"])
    print(f"\n[{alert['bank']}] Alert #{alert['id']}")
    print(f"  Merchant:  {result['merchant']}")
    print(f"  All entities:")
    for ent in result["entities"]:
        print(f"    - [{ent['label']}] {ent['text']}")