"""
Evaluation suite for the Hybrid Regex-NER parser.

Computes Precision, Recall, and F1-Score per field against ground truth.
Also runs baseline comparisons:
- Regex-only (no NER for merchant)
- NER-only (no regex for structured fields)
- Hybrid (our approach)
"""

from typing import Dict, List, Tuple
from app.services.parsers.hybrid_parser import HybridParser
from app.services.parsers.regex_parser import RegexParser
from app.services.parsers.ner_parser import NERParser

from tests.corpus import CORPUS


# ===== MATCHING LOGIC =====

def amounts_match(predicted, actual, tolerance: float = 0.01) -> bool:
    """Check if two amounts match within tolerance."""
    if predicted is None or actual is None:
        return False
    try:
        return abs(float(predicted) - float(actual)) < tolerance
    except (ValueError, TypeError):
        return False


def strings_match(predicted, actual) -> bool:
    """Case-insensitive string match."""
    if predicted is None or actual is None:
        return False
    return str(predicted).strip().lower() == str(actual).strip().lower()


def merchant_match(predicted, actual) -> bool:
    """Merchant match — checks if actual name is contained in predicted."""
    if predicted is None or actual is None:
        return False
    predicted_lower = str(predicted).strip().lower()
    actual_lower = str(actual).strip().lower()
    return actual_lower in predicted_lower


# ===== METRICS =====

class FieldMetrics:
    """Precision, Recall, F1 per field."""

    def __init__(self, name: str):
        self.name = name
        self.true_positives = 0
        self.false_positives = 0
        self.false_negatives = 0

    def evaluate(self, predicted, actual, match_fn):
        """Compare predicted vs actual."""
        has_actual = actual is not None
        has_predicted = predicted is not None

        if has_actual and has_predicted and match_fn(predicted, actual):
            self.true_positives += 1
        elif has_predicted and not (has_actual and match_fn(predicted, actual)):
            self.false_positives += 1
            if has_actual:
                self.false_negatives += 1
        elif has_actual and not has_predicted:
            self.false_negatives += 1

    @property
    def precision(self) -> float:
        denom = self.true_positives + self.false_positives
        return self.true_positives / denom if denom > 0 else 0.0

    @property
    def recall(self) -> float:
        denom = self.true_positives + self.false_negatives
        return self.true_positives / denom if denom > 0 else 0.0

    @property
    def f1(self) -> float:
        p, r = self.precision, self.recall
        return 2 * (p * r) / (p + r) if (p + r) > 0 else 0.0

    def report(self) -> Dict:
        return {
            "precision": round(self.precision, 4),
            "recall": round(self.recall, 4),
            "f1": round(self.f1, 4),
            "tp": self.true_positives,
            "fp": self.false_positives,
            "fn": self.false_negatives,
        }


# ===== EVALUATORS =====

FIELD_CONFIG = {
    "amount": amounts_match,
    "transaction_type": strings_match,
    "account_number": strings_match,
    "balance": amounts_match,
    "merchant": merchant_match,
}


def evaluate_parser(parser, corpus, parser_name: str) -> Dict:
    """Run evaluation for a given parser against the corpus."""
    metrics = {field: FieldMetrics(field) for field in FIELD_CONFIG}

    for alert in corpus:
        ground_truth = alert["ground_truth"]
        try:
            result = parser.parse(alert["body"])
        except Exception:
            result = {}

        for field, match_fn in FIELD_CONFIG.items():
            predicted = result.get(field)
            actual = ground_truth.get(field)
            metrics[field].evaluate(predicted, actual, match_fn)

    # Aggregate
    per_field = {field: m.report() for field, m in metrics.items()}
    avg_precision = sum(m.precision for m in metrics.values()) / len(metrics)
    avg_recall = sum(m.recall for m in metrics.values()) / len(metrics)
    avg_f1 = sum(m.f1 for m in metrics.values()) / len(metrics)

    return {
        "parser": parser_name,
        "per_field": per_field,
        "average": {
            "precision": round(avg_precision, 4),
            "recall": round(avg_recall, 4),
            "f1": round(avg_f1, 4),
        },
    }


# ===== BASELINES =====

class RegexOnlyParser:
    """Baseline: regex only. Merchant always None."""
    def __init__(self):
        self.regex = RegexParser()

    def parse(self, text: str) -> dict:
        result = self.regex.parse(text)
        result["merchant"] = None  # No NER
        return result


class NEROnlyParser:
    """Baseline: NER only. Structured fields always None."""
    def __init__(self):
        self.ner = NERParser()

    def parse(self, text: str) -> dict:
        result = self.ner.parse(text)
        return {
            "amount": None,
            "transaction_type": None,
            "date": None,
            "account_number": None,
            "balance": None,
            "merchant": result["merchant"],
        }


# ===== REPORTING =====

def print_report(report: Dict):
    """Pretty print evaluation report."""
    print("\n" + "=" * 80)
    print(f"PARSER: {report['parser']}")
    print("=" * 80)
    print(f"\n{'Field':<20} {'Precision':>12} {'Recall':>12} {'F1-Score':>12}")
    print("-" * 60)

    for field, metrics in report["per_field"].items():
        print(
            f"{field:<20} "
            f"{metrics['precision'] * 100:>11.2f}% "
            f"{metrics['recall'] * 100:>11.2f}% "
            f"{metrics['f1'] * 100:>11.2f}%"
        )

    print("-" * 60)
    avg = report["average"]
    print(
        f"{'AVERAGE':<20} "
        f"{avg['precision'] * 100:>11.2f}% "
        f"{avg['recall'] * 100:>11.2f}% "
        f"{avg['f1'] * 100:>11.2f}%"
    )


def print_comparison(reports: List[Dict]):
    """Print side-by-side comparison of all parsers."""
    print("\n" + "=" * 80)
    print("FINAL COMPARISON — ALL PARSERS")
    print("=" * 80)

    print(f"\n{'Parser':<25} {'Precision':>12} {'Recall':>12} {'F1-Score':>12}")
    print("-" * 65)

    for report in reports:
        avg = report["average"]
        print(
            f"{report['parser']:<25} "
            f"{avg['precision'] * 100:>11.2f}% "
            f"{avg['recall'] * 100:>11.2f}% "
            f"{avg['f1'] * 100:>11.2f}%"
        )

    print("-" * 65)


# ===== MAIN =====

def main():
    print(f"\nEvaluating on {len(CORPUS)} alerts...")

    # 1. Regex-only baseline
    regex_report = evaluate_parser(RegexOnlyParser(), CORPUS, "Regex-Only")

    # 2. NER-only baseline
    ner_report = evaluate_parser(NEROnlyParser(), CORPUS, "NER-Only")

    # 3. Hybrid (our approach)
    hybrid_report = evaluate_parser(HybridParser(), CORPUS, "Hybrid Regex-NER (Ours)")

    # Print detailed reports
    print_report(regex_report)
    print_report(ner_report)
    print_report(hybrid_report)

    # Print comparison
    print_comparison([regex_report, ner_report, hybrid_report])


if __name__ == "__main__":
    main()