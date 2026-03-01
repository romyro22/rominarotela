#!/usr/bin/env bash
# Security audit script — detects common anti-patterns in TypeScript source code.
# Exit 0 if clean, exit 1 if findings detected.

set -euo pipefail

FINDINGS=0
SRC_DIR="src"

red()    { printf '\033[0;31m%s\033[0m\n' "$1"; }
green()  { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$1"; }

check() {
  local label="$1"
  local pattern="$2"
  local severity="$3"

  results=$(grep -rn --include='*.ts' -E "$pattern" "$SRC_DIR" 2>/dev/null || true)
  if [ -n "$results" ]; then
    FINDINGS=$((FINDINGS + 1))
    red "[$severity] $label"
    echo "$results" | while IFS= read -r line; do
      echo "  $line"
    done
    echo ""
  fi
}

echo "=== Security Audit ==="
echo "Scanning $SRC_DIR/ ..."
echo ""

# 1. SQL string interpolation in .prepare() — potential SQL injection
# Allowlisted: artwork-service.ts:updateArtwork uses setClauses from hardcoded field map (safe)
results=$(grep -rn --include='*.ts' -E '\.prepare\(\s*`[^`]*\$\{' "$SRC_DIR" 2>/dev/null || true)
results=$(echo "$results" | grep -v 'setClauses' || true)
if [ -n "$results" ]; then
  FINDINGS=$((FINDINGS + 1))
  red "[MEDIUM] SQL interpolation in .prepare() — use parameterized .bind() instead"
  echo "$results" | while IFS= read -r line; do
    echo "  $line"
  done
  echo ""
fi

# 2. Double type cast (as unknown as) — bypasses type system entirely
check \
  "Double cast (as unknown as) — use type guard instead" \
  'as unknown as [A-Z]' \
  "HIGH"

# 3. Untyped 'as any' without justification
check \
  "Unsafe 'as any' — add @ts-expect-error with justification or use proper types" \
  'as any[^.]' \
  "HIGH"

# 4. console.log with template literal — may expose secrets
check \
  "console.log with template literal — use JSON.stringify for structured logging" \
  'console\.log\(\s*`' \
  "MEDIUM"

# 5. Hardcoded secret patterns
check \
  "Potential hardcoded secret — use environment variables instead" \
  '(const|let|var)\s+(API_KEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY)\s*=\s*["\x27]' \
  "CRITICAL"

# 6. JSON.parse without surrounding try/catch (heuristic: same-line parse without try)
# This is a rough heuristic — checks for JSON.parse not inside a try block
results=$(grep -rn --include='*.ts' 'JSON\.parse(' "$SRC_DIR" 2>/dev/null || true)
if [ -n "$results" ]; then
  uncaught=""
  while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    lineno=$(echo "$line" | cut -d: -f2)
    # Check if this line is inside a try block (look at surrounding 3 lines above)
    context=$(sed -n "$((lineno > 3 ? lineno - 3 : 1)),${lineno}p" "$file" 2>/dev/null || true)
    if ! echo "$context" | grep -q 'try'; then
      uncaught="${uncaught}  ${line}\n"
    fi
  done <<< "$results"
  if [ -n "$uncaught" ]; then
    FINDINGS=$((FINDINGS + 1))
    red "[HIGH] JSON.parse without try/catch — wrap in try/catch to handle corrupt data"
    printf "%b" "$uncaught"
    echo ""
  fi
fi

# Results
echo "=== Results ==="
if [ "$FINDINGS" -eq 0 ]; then
  green "PASS — No security findings detected."
  exit 0
else
  red "FAIL — $FINDINGS finding(s) detected. Review and fix before deploying."
  exit 1
fi
