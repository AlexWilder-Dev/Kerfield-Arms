#!/usr/bin/env bash
# Downloads the venue's photography and logo, then writes web-sized copies to /images.
# Originals land in images/src (git-ignored); resized files are committed.
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p images/src

B="https://images.squarespace-cdn.com/content/v1/67a08908b0eb9932900e0e5f"
Q="?format=2500w"

curl -sS --fail --retry 3 \
  -o images/src/logo.png       "$B/72acd39a-1a69-43ba-8f81-b211e3947908/Logo+for+web1.png$Q" \
  -o images/src/michelin.png   "$B/456cd5b4-89f8-4d21-a7a7-f3d8025e06cf/1+MICHELIN+Star_2026_Vertical_White.png$Q" \
  -o images/src/april-17.jpg   "$B/1108a4e4-f181-464e-9d68-8a01990c93ea/The+Kerfield+%28April+shoot%29+jwhowardphoto+-+HR-17.jpg$Q" \
  -o images/src/october-08.jpg "$B/21667ccf-6641-48f3-843a-0cd3e0e938d1/Kerfield+-+October+-+HR-8.jpg$Q" \
  -o images/src/october-11.jpg "$B/c381438a-7495-4224-bbcb-f1579bacaf00/Kerfield+-+October+-+HR-11.jpg$Q" \
  -o images/src/october-04.jpg "$B/6188694d-2697-4f23-bedc-293c742092fb/Kerfield+-+October+-+HR-4.jpg$Q" \
  -o images/src/october-06.jpg "$B/f23aa37d-e43e-42ae-a3d6-72e150cea87c/Kerfield+-+October+-+HR-6.jpg$Q" \
  -o images/src/october-15.jpg "$B/1793c099-5cf7-4b45-a904-0e4968bb7075/Kerfield+-+October+-+HR-15.jpg$Q" \
  -o images/src/october-05.jpg "$B/36b07b91-239e-4605-8741-0e447fa6bf3c/Kerfield+-+October+-+HR-5.jpg$Q" \
  -o images/src/october-20.jpg "$B/1f241f80-6776-42d5-bd16-6edb23c0a25e/Kerfield+-+October+-+HR-20.jpg$Q" \
  -o images/src/october-27.jpg "$B/eae3cb4f-cf60-4c52-a7a5-e1451defca3b/Kerfield+-+October+-+HR-27.jpg$Q" \
  -o images/src/october-34.jpg "$B/5e7c52dc-746e-416f-ae20-b3085e8039ca/Kerfield+-+October+-+HR-34.jpg$Q" \
  -o images/src/october-09.jpg "$B/724eac3f-4ee0-4073-ba70-9285d0e5c821/Kerfield+-+October+-+HR-9.jpg$Q" \
  -o images/src/october-38.jpg "$B/c8ab2bde-ab8a-4c87-9272-ad4b0fb70f82/Kerfield+-+October+-+LR-38.jpg$Q"

python3 scripts/resize-images.py images/src images
