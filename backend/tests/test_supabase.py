"""Test Supabase connection."""

from app.core.supabase_client import supabase


def test_connection():
    print("Testing Supabase connection...")
    try:
        # Try to query the users table (empty but should work)
        response = supabase.table("users").select("*").limit(1).execute()
        print(f"✅ Supabase connected!")
        print(f"   Users table response: {response.data}")
        print(f"   (Empty list is OK — no users yet)")

        # Test transactions table
        response = supabase.table("transactions").select("*").limit(1).execute()
        print(f"✅ Transactions table accessible!")
        print(f"   Response: {response.data}")

        # Test accounts table
        response = supabase.table("accounts").select("*").limit(1).execute()
        print(f"✅ Accounts table accessible!")

    except Exception as e:
        print(f"❌ Error: {e}")
        raise


if __name__ == "__main__":
    test_connection()