#!/usr/bin/env bash
# STEP 2-6 image batch (sequential). Skips files that already exist.
set -uo pipefail
cd <リポジトリ>
O=<作業用一時フォルダ>/img26
mkdir -p $O
REF=steps/step-01/images/profile.png
STYLE="Anime-style illustration with soft painterly lighting. Quiet late-night mood. Limited palette: deep indigo night, pale ramune-soda aqua, and warm desk-lamp yellow as the only warm accent. No neon glow, no lens flares, no rainbow gradients. No text, no letters, no logos, no watermark."
CHAR="The character is Lumi, an original fictional AI idol girl: long silver-lavender hair with pale aqua streaks, blue eyes, white jacket with navy lining, small white headset."
g() { [[ -f "$O/$1" ]] && { echo "skip $1"; return; }; tools/gen-image.sh "$O/$1" "$2" ${3:-} || echo "FAILED $1"; }
g hero.png "$CHAR She sits at a small desk by a window late at night, wearing over-ear headphones, speaking softly into a vintage radio microphone. A warm desk lamp lights her face; a hand-drawn star chart is pinned on the wall; through the rain-streaked window a few distant city lights. She glances toward the viewer with a gentle smile. Wide 16:9 composition, character placed in the right half, the left third is calm dark wall suitable for overlaying text. $STYLE" $REF
g jacket-lumen-drop.png "Square single cover art. $CHAR At dusk under a pale ramune-coloured sunset sky, she holds up a glass ramune soda bottle; a single drop of light falls inside the bottle. Upper body, calm expression, simple uncluttered composition with sky as background. $STYLE" $REF
g jacket-midnight-signal.png "Square single cover art. $CHAR Midnight in a dark room, she leans toward a radio microphone with headphones on; a small warm 'on air' lamp glows (no text on it); a radio dial with a frequency scale (no readable text) in the foreground. Intimate close-up, mostly dark indigo with one warm light. $STYLE" $REF
g jacket-lumina.png "Square album cover art. $CHAR She lies on her back on the floor of an empty planetarium, seen from above, hair spread out, looking up at a dome full of constellations drawn with thin lines. Calm, dreamy, wide negative space of star field. $STYLE" $REF
g goods-acrylic.png "Product photo of a clear acrylic standee of an anime character (the character from the reference, full body, waving), standing on a wooden desk next to a small desk lamp at night, shallow depth of field, realistic product photography, plain dark background, square. No text, no logos, no watermark." $REF
g goods-penlight.png "Product photo of a slim concert penlight glowing pale aqua, lying diagonally on a dark indigo fabric surface, realistic product photography, soft reflections, square, minimal composition. No text, no logos, no watermark."
g goods-tee.png "Flat-lay product photo of a navy blue T-shirt with a small white line-drawn star-chart constellation print on the chest, on a light grey surface, realistic product photography, square. No text, no letters, no logos, no watermark."
g goods-card.png "Product photo of five holographic trading cards fanned out on a dark desk, each card showing a different small illustration of the same anime idol girl (from the reference), subtle holographic sheen, realistic product photography, square. No readable text, no logos, no watermark." $REF
ls -la $O
