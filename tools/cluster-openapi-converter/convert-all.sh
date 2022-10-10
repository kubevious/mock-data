#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"
cd $MY_DIR

source configuration.sh

./build.sh
RESULT=$?
if [ $RESULT -ne 0 ]; then
  echo "Build failed"
  exit 1;
fi

export LOG_TO_FILE=false
export NODE_ENV=development

for dir in /${OPENAPI_RAW_ROOT_DIR}/*/; do
  dir=${dir%*/}

  export K8S_VERSION="${dir##*/}"
  echo "K8S_VERSION=${K8S_VERSION}"

  
done

# for TARGET_KIND_VERSION in ${TARGET_KIND_VERSIONS[@]}; do

#   echo "*************************************************************** "
#   echo "*** Processing KIND Cluster version: ${TARGET_KIND_VERSION}"
#   echo "*** "
#   echo ""

#   export TARGET_KIND_VERSION=${TARGET_KIND_VERSION}
#   ./start-cluster.sh
#   echo ""


# done