"""
Generate a synthetic corpus of Nigerian bank alerts for evaluation.

Takes seed alerts and generates variations by:
- Randomizing amounts
- Randomizing dates
- Randomizing account numbers
- Randomizing merchant names
- Randomizing balances
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict

# ===== SEED DATA =====

BANKS = ["GTB", "Zenith", "Access", "UBA", "First Bank"]

MERCHANTS = [
    "OLAMIDE JOHNSON", "CHIDI OKAFOR", "TUNDE ADEWALE", "BLESSING OKON",
    "MAMA NGOZI", "EMEKA OBI", "FUNKE ADEBAYO", "IBRAHIM MUSA",
    "TECH CORP LTD", "SHOPRITE IKEJA", "JUMIA NIGERIA", "MTN AIRTIME",
    "NETFLIX SUBSCRIPTION", "DSTV SUBSCRIPTION", "UBER RIDE",
    "FREELANCE CLIENT", "SALARY PAYMENT", "BUSINESS PAYMENT",
    "POS PURCHASE", "DIVIDEND PAYMENT", "REFUND FROM JUMIA",
]

NARRATION_TYPES = [
    "Transfer to {merchant}",
    "Transfer from {merchant}",
    "Payment to {merchant}",
    "Salary Payment - {merchant}",
    "POS Purchase - {merchant}",
    "Refund from {merchant}",
    "{merchant}",
]

# ===== TEMPLATES =====

TEMPLATES = {
    "GTB": {
        "debit": """Dear Customer,
A debit transaction of NGN {amount} occurred on your account.
Account: {account}
Date: {date}
Description: Transfer to {merchant}
Balance: NGN {balance}
Thank you for banking with GTB.""",
        "credit": """Dear Customer,
A credit transaction of NGN {amount} occurred on your account.
Account: {account}
Date: {date}
Description: {narration}
Balance: NGN {balance}
Thank you for banking with GTB.""",
    },
    "Zenith": {
        "debit": """Dear Valued Customer,
Your account {account} has been debited with NGN {amount}.
Transaction Date: {date}
Narration: {narration}
Available Balance: NGN {balance}
Zenith Bank.""",
        "credit": """Dear Valued Customer,
Your account {account} has been credited with NGN {amount}.
Transaction Date: {date}
Narration: {narration}
Available Balance: NGN {balance}
Zenith Bank.""",
    },
    "Access": {
        "debit": """ACCESS BANK
Transaction Alert
Account: {account}
Amount: NGN{amount}
Type: DEBIT
Date: {date}
Details: {narration}
Balance: NGN {balance}""",
        "credit": """ACCESS BANK
Transaction Alert
Account: {account}
Amount: NGN{amount}
Type: CREDIT
Date: {date}
Details: {narration}
Balance: NGN {balance}""",
    },
    "UBA": {
        "debit": """UBA Transaction Alert
Dear Customer,
Your account {account} was debited by NGN{amount} on {date}.
Beneficiary: {merchant}
Narration: {narration}
New Balance: NGN {balance}""",
        "credit": """UBA Transaction Alert
Dear Customer,
Your account {account} was credited by NGN{amount} on {date}.
Sender: {merchant}
Narration: {narration}
New Balance: NGN {balance}""",
    },
    "First Bank": {
        "debit": """First Bank of Nigeria
Transaction Notification
Acct: {account}
Amt: NGN {amount}
DR
Desc: {narration}
Date: {date}
Bal: NGN {balance}""",
        "credit": """First Bank of Nigeria
Transaction Notification
Acct: {account}
Amt: NGN {amount}
CR
Desc: {narration}
Date: {date}
Bal: NGN {balance}""",
    },
}


def generate_account() -> str:
    """Generate random 10-digit account number."""
    return "".join([str(random.randint(0, 9)) for _ in range(10)])


def generate_amount(min_val: float = 500, max_val: float = 500000) -> float:
    """Generate random amount with 2 decimals."""
    return round(random.uniform(min_val, max_val), 2)


def generate_balance(min_val: float = 1000, max_val: float = 2000000) -> float:
    """Generate random balance."""
    return round(random.uniform(min_val, max_val), 2)


def generate_date() -> str:
    """Generate random date within last 90 days."""
    days_ago = random.randint(0, 90)
    date = datetime.now() - timedelta(days=days_ago)
    # Random format
    formats = [
        date.strftime("%d-%m-%Y %H:%M"),
        date.strftime("%d/%m/%Y %H:%M:%S"),
        date.strftime("%d-%b-%Y %H:%M"),
        date.strftime("%b %d, %Y %H:%M"),
    ]
    return random.choice(formats)


def format_amount(amount: float) -> str:
    """Format amount with commas — NGN 50,000.00."""
    return f"{amount:,.2f}"


def generate_alert(bank: str, txn_type: str) -> Dict:
    """Generate a single alert with random data."""
    merchant = random.choice(MERCHANTS)
    narration_template = random.choice(NARRATION_TYPES)
    narration = narration_template.format(merchant=merchant)

    amount = generate_amount()
    balance = generate_balance()
    account = generate_account()
    date = generate_date()

    template = TEMPLATES[bank][txn_type]
    body = template.format(
        amount=format_amount(amount),
        balance=format_amount(balance),
        account=account,
        date=date,
        merchant=merchant,
        narration=narration,
    )

    # Ground truth (for evaluation)
    return {
        "bank": bank,
        "type": txn_type,
        "body": body,
        "ground_truth": {
            "amount": amount,
            "transaction_type": txn_type,
            "account_number": account,
            "balance": balance,
            "merchant": merchant,
        },
    }


def generate_corpus(size: int = 200) -> List[Dict]:
    """Generate a corpus of alerts."""
    corpus = []
    for i in range(size):
        bank = random.choice(BANKS)
        txn_type = random.choice(["debit", "credit"])
        alert = generate_alert(bank, txn_type)
        alert["id"] = i + 1
        corpus.append(alert)
    return corpus


def save_corpus(corpus: List[Dict], filepath: str):
    """Save corpus to a Python file for reuse."""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write('"""Auto-generated corpus for evaluation."""\n\n')
        f.write("CORPUS = ")
        f.write(repr(corpus))
        f.write("\n")


if __name__ == "__main__":
    print("Generating synthetic corpus...")
    corpus = generate_corpus(size=200)
    save_corpus(corpus, "tests/corpus.py")
    print(f"✅ Generated {len(corpus)} alerts")

    # Show sample
    print("\nSample alert:")
    print("=" * 70)
    print(f"Bank: {corpus[0]['bank']}")
    print(f"Type: {corpus[0]['type']}")
    print(f"Ground truth: {corpus[0]['ground_truth']}")
    print("\nBody:")
    print(corpus[0]["body"])