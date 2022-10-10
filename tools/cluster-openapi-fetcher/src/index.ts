import _ from 'the-lodash';
import { Promise } from 'the-promise';
import { logger } from './logger';
import * as Path from 'path'
import * as fs from 'fs'

import { KubernetesClient, connectDefaultRemoteCluster } from 'k8s-super-client';
import { KubernetesOpenApiResponse } from 'k8s-super-client/dist/open-api-client';

console.log("TEST 1234");

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

            
            return client.openAPI.queryAllPaths()
                .then(result => {

                    // logger.info("RESULT: ", result);
                    for(const apiName of _.keys(result))
                    {
                        logger.info("Discovered API: %s", apiName);
                    }

                    return persist(version, result);
                })
        })
}

function persist(version: string, entries: Record<string, KubernetesOpenApiResponse>)
{
    const TARGET_ROOT_DIR = Path.resolve(DATA_ROOT_DIR!, version);
    logger.info("TARGET_ROOT_DIR: %s", TARGET_ROOT_DIR);

    logger.info("Deleting: %s", TARGET_ROOT_DIR);
    fs.rmdirSync(TARGET_ROOT_DIR, { recursive: true});

    logger.info("Creating: %s", TARGET_ROOT_DIR);
    fs.mkdirSync(TARGET_ROOT_DIR);

    const indexData : Record<string, string> = {};

    for(const apiName of _.keys(entries))
    {
        const apiFile = `${apiName.replace(/\//g, '_')}.json`;
        indexData[apiName] = apiFile;

        const apiData = entries[apiName];
        const apiFilePath = Path.join(TARGET_ROOT_DIR, apiFile);
        writeData(apiFilePath, apiData);
    }

    writeData(Path.join(TARGET_ROOT_DIR, '.index.json'), indexData);

}

function writeData(fileName: string, data: any)
{
    logger.info("Writing: %s", fileName);

    fs.writeFileSync(fileName, _.stableStringify(data), { encoding: 'utf8'})
}
