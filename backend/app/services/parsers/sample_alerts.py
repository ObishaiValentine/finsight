"""
Sample Nigerian bank alert emails for testing the parser.
These mimic real-world formats from GTB, Zenith, Access, UBA, and First Bank.
"""

SAMPLE_ALERTS = [
    {
        "id": 1,
        "bank": "GTB",
        "subject": "Debit Alert",
        "body": """Dear Customer,
A debit transaction of NGN 50,000.00 occurred on your account.
Account: 0123456789
Date: 15-09-2026 14:30
Description: Transfer to OLAMIDE JOHNSON
Balance: NGN 250,000.00
Thank you for banking with GTB.""",
    },
    {
        "id": 2,
        "bank": "Zenith",
        "subject": "Credit Alert",
        "body": """Dear Valued Customer,
Your account 1234567890 has been credited with NGN 450,000.00.
Transaction Date: 15/09/2026 09:00:15
Narration: SALARY PAYMENT - TECH CORP LTD
Available Balance: NGN 680,000.00
Zenith Bank.""",
    },
    {
        "id": 3,
        "bank": "Access",
        "subject": "Transaction Notification",
        "body": """ACCESS BANK
Transaction Alert
Account: 2345678901
Amount: NGN12,500.00
Type: DEBIT
Date: Sep 14, 2026 18:15
Details: POS PURCHASE - SHOPRITE IKEJA
Balance: NGN 320,000.00""",
    },
    {
        "id": 4,
        "bank": "UBA",
        "subject": "UBA Alert",
        "body": """UBA Transaction Alert
Dear Customer,
Your account 3456789012 was debited by NGN25,000.00 on 14-09-2026 at 11:30 AM.
Beneficiary: CHIDI OKAFOR
Narration: Transfer
New Balance: NGN 145,000.00""",
    },
    {
        "id": 5,
        "bank": "First Bank",
        "subject": "FirstBank Alert",
        "body": """First Bank of Nigeria
Transaction Notification
Acct: 4567890123
Amt: NGN 8,500.00
CR
Desc: REFUND FROM JUMIA
Date: 13-09-2026 16:45
Bal: NGN 55,000.00""",
    },
    {
        "id": 6,
        "bank": "GTB",
        "subject": "Debit Alert",
        "body": """GTBank Alert
A debit of NGN2,000.00 was made on your account.
Acct No: 0123456789
Date: 13-Sep-2026 10:20
Desc: MTN AIRTIME PURCHASE
Avail Bal: NGN 248,000.00""",
    },
    {
        "id": 7,
        "bank": "Zenith",
        "subject": "Credit Alert",
        "body": """Zenith Bank Alert
Your account 1234567890 has been credited.
Amount: NGN 120,000.00
Date: 12/09/2026 11:00:00
Sender: FREELANCE CLIENT - ADEWALE
Balance: NGN 800,000.00""",
    },
    {
        "id": 8,
        "bank": "Access",
        "subject": "Debit Alert",
        "body": """Access Bank
Debit Alert
Amount: NGN 5,500.00
Account: 2345678901
Date: 11-Sep-2026
Narration: NETFLIX SUBSCRIPTION
Balance: NGN 314,500.00""",
    },
]