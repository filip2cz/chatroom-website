#!/bin/bash

error_abort() {
  echo "$1" >&2
  exit 1
}

get_signature() {
  local content="$1"
  local tmpfile="/tmp/$$.tmp"

  echo "$content" > "$tmpfile"
  # Změna: Přidejte klíč, který chcete použít pro podpis
  local keyid="VášGPGKlíčID"
  gpg --default-key "$keyid" --armor --output - --detach-sign "$tmpfile"
  rm -f "$tmpfile"
}

if [ $# -lt 1 ]; then
  error_abort "Usage: $0 <infile> [outfile]"
fi

filename="$1"
outfile="$2"

if [ ! -f "$filename" ]; then
  error_abort "File not found: $filename"
fi

data=$(cat "$filename")

# Minimize and strip the doctype
content=$(echo "$data" | npx minimize --spare --conditionals --empty --quotes | sed -e 's/^\s*<!doctype[^>]*>//i')

signature=$(get_signature "$content")

out=$(echo "$data" | sed -e "s/%%%SIGNED_PAGES_PGP_SIGNATURE%%%/$signature/g")

if [ -n "$outfile" ]; then
  echo "$out" > "$outfile" || error_abort "Failed to write to $outfile"
else
  echo "$out"
fi
