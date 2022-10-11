#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"
cd $MY_DIR

source configuration.sh

echo ""
echo "*** "
echo "*** Starting Kubernetes KIND Cluster: ${K8S_CLUSTER_NAME}, Version: ${TARGET_KIND_VERSION}"
echo "*** "

kind delete cluster --name ${K8S_CLUSTER_NAME}

kind create cluster --name ${K8S_CLUSTER_NAME} --kubeconfig ${K8S_CONFIG_PATH} --image ${TARGET_KIND_VERSION}
