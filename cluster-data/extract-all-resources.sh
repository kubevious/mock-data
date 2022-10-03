#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"

cd ${MY_DIR}

echo "*** EXTRACT KUBERNETES RESOURCES ***" 
MOCK_DATA_NAME=openshift

ROOT_OUTPUT_DIR=${MY_DIR}/${MOCK_DATA_NAME}

NAMESPACES=$(kubectl get namespace | awk '{print $1}' | tail -n +2 | sort | uniq)
for NAMESPACE in ${NAMESPACES}; do
  echo "NAMESPACE : ${NAMESPACE}"
done

NAMESPACED_API_RESOURCES=$(kubectl api-resources --verbs=list --namespaced -o name | sort | uniq)
for NAMESPACED_API_RESOURCE in ${NAMESPACED_API_RESOURCES}; do
  echo "NAMESPACED_API_RESOURCE: ${NAMESPACED_API_RESOURCE}"
done

CLUSTERED_API_RESOURCES=$(kubectl api-resources --verbs=list --namespaced=false -o name | sort | uniq)
for CLUSTERED_API_RESOURCE in ${CLUSTERED_API_RESOURCES}; do
  echo "CLUSTERED_API_RESOURCE: ${CLUSTERED_API_RESOURCE}"
done

rm -rf ${ROOT_OUTPUT_DIR}
mkdir -p ${ROOT_OUTPUT_DIR}

COUNTER=0

for CLUSTERED_API_RESOURCE in ${CLUSTERED_API_RESOURCES}; do
  echo "> CLUSTERED_API_RESOURCE: ${CLUSTERED_API_RESOURCE}"

  RESOURCES=$(kubectl get ${CLUSTERED_API_RESOURCE} -o name)
  echo "    > RESOURCE COUNT: ${#RESOURCES[@]}"

  COUNTER=0
  for RESOURCE_KEY in ${RESOURCES}; do
    echo "    > RESOURCE_KEY: ${RESOURCE_KEY}"
    RESOURCE_PATH=${ROOT_OUTPUT_DIR}/clustered/${RESOURCE_KEY}.yaml
    echo "      > RESOURCE_PATH: ${RESOURCE_PATH}"
    mkdir -p $(dirname ${RESOURCE_PATH})
    
    $(kubectl get ${RESOURCE_KEY} -o yaml > ${RESOURCE_PATH}) &

    COUNTER=$((COUNTER+1))
    echo "      > COUNTER: $COUNTER"
    if [ $COUNTER -gt 10 ]; then
      echo "      > Waiting..."
      wait
      COUNTER=0
    fi
  done

  wait

done

wait

for NAMESPACED_API_RESOURCE in ${NAMESPACED_API_RESOURCES}; do
  echo "> NAMESPACED_API_RESOURCE: ${NAMESPACED_API_RESOURCE}"

  for NAMESPACE in ${NAMESPACES}; do
    echo "  > FETCHING ${NAMESPACED_API_RESOURCE} in ${NAMESPACE}"

    RESOURCES=$(kubectl get ${NAMESPACED_API_RESOURCE} -n ${NAMESPACE} -o name)
    echo "    > RESOURCE COUNT: ${#RESOURCES[@]}"

    COUNTER=0
    for RESOURCE_KEY in ${RESOURCES}; do
      echo "    > RESOURCE_KEY: ${RESOURCE_KEY}"
      RESOURCE_PATH=${ROOT_OUTPUT_DIR}/namespaced/${NAMESPACE}/${RESOURCE_KEY}.yaml
      echo "      > RESOURCE_PATH: ${RESOURCE_PATH}"
      mkdir -p $(dirname ${RESOURCE_PATH})
      
      $(kubectl get ${RESOURCE_KEY} -n ${NAMESPACE} -o yaml > ${RESOURCE_PATH}) &

      COUNTER=$((COUNTER+1))
      echo "      > COUNTER: $COUNTER"
      if [ $COUNTER -gt 10 ]; then
        echo "      > Waiting..."
        wait
        COUNTER=0
      fi
    done

    wait

  done

done

wait