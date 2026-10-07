#!/usr/bin/env python3
"""
Infrastructure as Code (IaC) Verification Entrypoint.
Executes the full automated security rules test suite.
"""

from test_security_rules import *

if __name__ == "__main__":
    import sys
    tests = [v for k, v in list(globals().items()) if k.startswith("test_") and callable(v)]
    passed = 0
    failed = 0
    print("=" * 70)
    print("  CT LIVE — IAC SECURITY COMPLIANCE & RULES VERIFICATION")
    print("=" * 70)
    for test in tests:
        try:
            test()
            print(f"  [PASS] {test.__name__}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {test.__name__}: {e}")
            failed += 1
    print("=" * 70)
    print(f"  {passed} passed, {failed} failed out of {len(tests)} tests")
    print("=" * 70)
    if failed > 0:
        sys.exit(1)
