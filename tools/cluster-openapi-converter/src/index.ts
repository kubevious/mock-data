import _ from 'the-lodash';
import { logger } from './logger';
import * as Path from 'path'
import * as fs from 'fs'

import { K8sOpenApiSpecs } from 'k8s-super-client';
import { K8sOpenApiSpecToJsonSchemaConverter } from 'k8s-super-client';
import { K8sApiJsonSchema } from 'k8s-super-client/dist/open-api/converter/types';

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

function loadClusterVersion() : K8sOpenApiSpecs
{
    const k8sOpenApiSpecs = readData(Path.join(MY_INPUT_DIR, 'api-specs.json')) as K8sOpenApiSpecs;
    return k8sOpenApiSpecs;
}

function convertApiDefinitions(k8sOpenApiSpecs: K8sOpenApiSpecs) : K8sApiJsonSchema
{
    const converter = new K8sOpenApiSpecToJsonSchemaConverter(logger, k8sOpenApiSpecs);

    return converter.convert();
}


{
    const k8sOpenApiSpecs = loadClusterVersion();
    // writeData(Path.join(K8S_API_ROOT_DIR, `${K8S_VERSION}-OpenApi.json`), openAPIData, true);

    const k8sApiJsonSchema = convertApiDefinitions(k8sOpenApiSpecs);
    writeData(Path.join(K8S_API_ROOT_DIR, `${K8S_VERSION}.json`), k8sApiJsonSchema, false);
}


function readData(fileName: string)
{
    logger.info("Reading: %s", fileName);
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
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
