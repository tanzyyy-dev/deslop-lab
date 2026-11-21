#!/usr/bin/env bash
# Generate one image with the local Codex CLI (ChatGPT login, built-in image_generation tool)
# and copy it to <output.png>. The exact prompt is saved next to it as <output>.prompt.md.
#
# usage: tools/gen-image.sh <output.png> "<image prompt>" [reference-image]
#   reference-image (optional): attached to the Codex request so the same character design is kept.
# Run one generation at a time: the newest file in ~/.codex/generated_images is taken as the result.
set -euo pipefail
out="$1"; prompt="$2"; ref="${3:-}"
if [[ -n "$ref" ]]; then
  [[ -f "$ref" ]] || { echo "reference not found: $ref" >&2; exit 1; }
  ref="$(cd "$(dirname "$ref")" && pwd)/$(basename "$ref")"
fi
gen_dir="$HOME/.codex/generated_images"
marker="$(mktemp)"
mkdir -p "$(dirname "$out")"
work="$(mktemp -d)"
args=(exec --skip-git-repo-check -s read-only)
instr="Use your built-in image generation tool exactly once to generate the image described below. Do not write any files and do not run shell commands. After generating, reply only with the word DONE."
if [[ -n "$ref" ]]; then
  args+=(-i "$ref")
  instr="$instr The attached image is the character reference: keep the same character design (face, hair, eye colour, outfit motifs) unless the prompt says otherwise. Do not copy its composition."
fi
( cd "$work" && codex "${args[@]}" "$instr

IMAGE PROMPT:
$prompt" >/dev/null 2>&1 ) || true
newest="$(find "$gen_dir" -name '*.png' -newer "$marker" -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -1 || true)"
rm -f "$marker"; rm -rf "$work"
if [[ -z "$newest" ]]; then echo "no image generated" >&2; exit 1; fi
cp "$newest" "$out"
{
  echo "# Image generation record"
  echo
  echo "- output: \`$(basename "$out")\`"
  echo "- tool: Codex CLI $(codex --version 2>/dev/null | awk '{print $2}') (built-in image_generation, ChatGPT login)"
  echo "- generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  [[ -n "$ref" ]] && echo "- character reference attached: \`$(basename "$ref")\`"
  echo
  echo "## Prompt"
  echo
  echo '```text'
  echo "$prompt"
  echo '```'
} > "${out%.*}.prompt.md"
echo "$out"
