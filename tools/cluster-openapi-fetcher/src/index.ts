import _ from 'the-lodash';
import { Promise } from 'the-promise';
import { logger } from './logger';
import * as Path from 'path'
import * as fs from 'fs'

import { KubernetesClient, connectDefaultRemoteCluster } from 'k8s-super-client';

const DATA_ROOT_DIR = process.env.DATA_ROOT_DIR;
logger.info("DATA_ROOT_DIR=%s", DATA_ROOT_DIR);
if (!DATA_ROOT_DIR) {
    logger.error("DATA_ROOT_DIR not set!");
    process.exit(1);
}

Promise.resolve()
    .then(() => {
        return connectDefaultRemoteCluster(logger.sublogger('k8s'));
    })
    .then(client => {
        logger.info("Connected.");

        return processCluster(client);
    })
    .catch(reason => {
        logger.error("ERROR Connecting: ", reason);
        process.exit(1);
    });

function processCluster(client: KubernetesClient)
{    
    return client.openAPI.queryClusterVersion()
        .then(version => {
            logger.info("Cluster version: %s", version);

            const TARGET_CLUSTER_DIR = prepareClusterDirectory(version);

            return client.openAPI.queryApiSpecs()
                .then(apiSpecs => {

                    writeData(Path.join(TARGET_CLUSTER_DIR, 'api-specs.json'), apiSpecs, false);
    
                })
            
        })
}

function prepareClusterDirectory(version: string)
{
    const TARGET_ROOT_DIR = Path.resolve(DATA_ROOT_DIR!, version);
    logger.info("TARGET_ROOT_DIR: %s", TARGET_ROOT_DIR);

    logger.info("Deleting: %s", TARGET_ROOT_DIR);
    fs.rmdirSync(TARGET_ROOT_DIR, { recursive: true});

    logger.info("Creating: %s", TARGET_ROOT_DIR);
    fs.mkdirSync(TARGET_ROOT_DIR);
 
    return TARGET_ROOT_DIR;
}


function writeData(fileName: string, data: any, pretty?: boolean)
{
    logger.info("Writing: %s", fileName);
    if (pretty) {
        fs.writeFileSync(fileName, JSON.stringify(data, null, 4), { encoding: 'utf8'})
    } else {
        fs.writeFileSync(fileName, _.stableStringify(data), { encoding: 'utf8'})
    }
}