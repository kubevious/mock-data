import _ from 'the-lodash';
import { Promise } from 'the-promise';
import { logger } from './logger';
import * as Path from 'path'
import * as fs from 'fs'

import { KubernetesClient, connectDefaultRemoteCluster } from 'k8s-super-client';
import { KubernetesOpenApiV2Root } from 'k8s-super-client/dist/open-api/open-api-v2';
import { KubernetesOpenApiV3Response } from 'k8s-super-client/dist/open-api/open-api-v3';
import { SchemaObject } from 'ajv';
import { K8sApiSpecConverter } from './k8s-api-spec-converter';

const OPENAPI_RAW_ROOT_DIR = process.env.OPENAPI_RAW_ROOT_DIR;
logger.info("OPENAPI_RAW_ROOT_DIR=%s", OPENAPI_RAW_ROOT_DIR);
if (!OPENAPI_RAW_ROOT_DIR) {
    logger.error("OPENAPI_RAW_ROOT_DIR not set!");
    process.exit(1);
}

const K8S_API_ROOT_DIR = process.env.K8S_API_ROOT_DIR;
logger.info("K8S_API_ROOT_DIR=%s", OPENAPI_RAW_ROOT_DIR);
if (!K8S_API_ROOT_DIR) {
    logger.error("K8S_API_ROOT_DIR not set!");
    process.exit(1);
}

const K8S_VERSION = process.env.K8S_VERSION;
logger.info("K8S_VERSION=%s", OPENAPI_RAW_ROOT_DIR);
if (!K8S_VERSION) {
    logger.error("K8S_VERSION not set!");
    process.exit(1);
}

const MY_INPUT_DIR = Path.join(OPENAPI_RAW_ROOT_DIR, K8S_VERSION);

function loadClusterVersion() : KubernetesOpenApiData
{
    const indexData = readData(Path.join(MY_INPUT_DIR, '.index.json'));
    const swaggerVersion = indexData.swagger;
    logger.info("Swagger Version: %s", swaggerVersion);

    if (swaggerVersion == '2.0')
    {
        return {
            openApiVersion: swaggerVersion,
            openApiV2Data: indexData
        }
    }
    else
    {
        const result : KubernetesOpenApiData = {
            openApiVersion: '3.0',
            openApiV3Data: {}
        };

        for(const apiName of _.keys(indexData))
        {
            const fileName = indexData[apiName];
            result.openApiV3Data[apiName] = readData(Path.join(MY_INPUT_DIR, fileName));
        }

        return result;
    }
}

function convertApiDefinitions(openApiData: KubernetesOpenApiData) : KubernetesApiData
{
    const converter = new K8sApiSpecConverter(logger, openApiData);

    return converter.convert();
}


{
    const openAPIData = loadClusterVersion();
    writeData(Path.join(K8S_API_ROOT_DIR, `${K8S_VERSION}-raw.json`), openAPIData);

    const k8sDefinitions = convertApiDefinitions(openAPIData);
    writeData(Path.join(K8S_API_ROOT_DIR, `${K8S_VERSION}.json`), k8sDefinitions);
}

interface KubernetesOpenApiData
{
    openApiVersion: string;
    openApiV3Data?: any;
    openApiV2Data?: any;
}

interface KubernetesApiData 
{
    definitions: Record<string, SchemaObject>
}


function readData(fileName: string)
{
    logger.info("Reading: %s", fileName);
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}

function writeData(fileName: string, data: any)
{
    logger.info("Writing: %s", fileName);
    fs.writeFileSync(fileName, JSON.stringify(data, null, 4), { encoding: 'utf8'})
    // fs.writeFileSync(fileName, _.stableStringify(data), { encoding: 'utf8'})
}
