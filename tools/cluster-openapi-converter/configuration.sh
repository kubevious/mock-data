#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"

# input:
export OPENAPI_RAW_ROOT_DIR=${MY_DIR}/../../cluster-openapi

# output:
export K8S_API_ROOT_DIR=${MY_DIR}/../../k8s-apis
