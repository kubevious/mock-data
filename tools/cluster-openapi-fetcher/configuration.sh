#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"

export DATA_ROOT_DIR=${MY_DIR}/../../cluster-openapi

export K8S_CLUSTER_NAME=kubevious-mock-api
export K8S_CONFIG_PATH=${MY_DIR}/runtime/kube-config.yaml

TARGET_KIND_VERSIONS=()
TARGET_KIND_VERSIONS+=("kindest/node:v1.25.2")
TARGET_KIND_VERSIONS+=("kindest/node:v1.24.6")
TARGET_KIND_VERSIONS+=("kindest/node:v1.23.12")
TARGET_KIND_VERSIONS+=("kindest/node:v1.22.15")
TARGET_KIND_VERSIONS+=("kindest/node:v1.21.14")
TARGET_KIND_VERSIONS+=("kindest/node:v1.20.15")
TARGET_KIND_VERSIONS+=("kindest/node:v1.19.16")
TARGET_KIND_VERSIONS+=("kindest/node:v1.18.20")
TARGET_KIND_VERSIONS+=("kindest/node:v1.17.17")
TARGET_KIND_VERSIONS+=("kindest/node:v1.16.15")
TARGET_KIND_VERSIONS+=("kindest/node:v1.15.12")
TARGET_KIND_VERSIONS+=("kindest/node:v1.14.10")


### DEBUGGING ONLY
### DO NOT CHECKIN!!!
# export TARGET_KIND_VERSION=kindest/node:v1.25.2
# export TARGET_KIND_VERSION=kindest/node:v1.14.10
