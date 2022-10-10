#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"
cd $MY_DIR

source configuration.sh

echo ""
echo "*** "
echo "*** Deleting Kubernetes KIND Cluster: ${K8S_CLUSTER_NAME}"
echo "*** "

kind delete cluster --name ${K8S_CLUSTER_NAME}

rm ${K8S_CONFIG_PATH}