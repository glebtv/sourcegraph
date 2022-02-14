#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -ex

OUTPUT=$(mktemp -d -t sgpostgres_exporter_XXXXXXX)
export OUTPUT
cleanup() {
  rm -rf "$OUTPUT"
}
trap cleanup EXIT

mkdir -p "${OUTPUT}"
OUTPUT_FILE="${OUTPUT}/queries.yaml"
CODEINTEL_OUTPUT_FILE="${OUTPUT}/code_intel_queries.yaml"

for source in ./config/*.yaml; do
  {
    if [[ "$source" == *"codeintel"* ]]; then
      echo "# skipping $source"
      continue
    fi
    echo "# source: ${source}"
    cat "$source"
    echo ""
  } >>"${OUTPUT_FILE}"
done

for source in ./config/*.yaml; do
  {
    if [[ "$source" == *"standard"* ]]; then
      echo "# skipping $source"
      continue
    fi
    echo "# source: ${source}"
    cat "$source"
    echo ""
  } >>"${CODEINTEL_OUTPUT_FILE}"
done

echo "${OUTPUT_FILE}"
echo "${CODEINTEL_OUTPUT_FILE}"

docker pull us.gcr.io/sourcegraph-dev/postgres_exporter:insiders || true

docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from us.gcr.io/sourcegraph-dev/postgres_exporter:insiders \
  -f ./Dockerfile -t "${IMAGE:-sourcegraph/postgres_exporter}" "${OUTPUT}" \
  --progress=plain \
  --build-arg COMMIT_SHA \
  --build-arg DATE \
  --build-arg VERSION
