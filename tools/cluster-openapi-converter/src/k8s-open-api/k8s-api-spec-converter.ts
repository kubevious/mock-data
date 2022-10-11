import _ from 'the-lodash';
import { ILogger } from 'the-logger';
import { SchemaObject } from 'ajv';
import { KubernetesOpenApiV3Response } from 'k8s-super-client/dist/open-api/open-api-v3';

import { KubernetesOpenApiV3Root, OpenApiv3PathInfo } from 'k8s-super-client';
import { KubernetesOpenApiV2Root, OpenApiv2PathInfo } from 'k8s-super-client';
import { OpenApiV3SchemaObject } from './open-api-v3';
import { OpenApiV3DocumentParser } from './open-api-v3-document-parser';
import { OpenApiV2DocumentParser } from './open-api-v2-document-parser';

export class K8sApiSpecConverter
{
    private _logger : ILogger;
    private _openApiData: KubernetesOpenApiData;

    private _k8sApiData : KubernetesApiData = {
        resources: {},
        definitions: {}
    };

    constructor(logger: ILogger, openApiData: KubernetesOpenApiData)
    {
        this._logger = logger;
        this._openApiData = openApiData;
    }

    convert() : KubernetesApiData
    {
        this._k8sApiData.definitions = {};

        if (this._openApiData.openApiV3Data)
        {
            this._convertOpenApiV3();
        }

        if (this._openApiData.openApiV2Data)
        {
            this._convertOpenApiV2(this._openApiData.openApiV2Data);
        }

        // this._logger.info("ALL RESOURCES: ", this._k8sApiData.resources);
        // this._logger.info("ALL TYPES: ", _.keys(this._k8sApiData.definitions));

        return this._k8sApiData;
    }

    private _convertOpenApiV3()
    {
        for(const apiName of _.keys(this._openApiData.openApiV3Data))
        {
            const document = this._openApiData.openApiV3Data![apiName];
            this._convertOpenApiV3Document(document);
        }
    }

    private _convertOpenApiV3Document(document: KubernetesOpenApiV3Response)
    {
        const documentParser = new OpenApiV3DocumentParser(this._logger, this._k8sApiData, document);
        documentParser.convert();
    }

    private _convertOpenApiV2(document: KubernetesOpenApiV2Root)
    {
        const documentParser = new OpenApiV2DocumentParser(this._logger, this._k8sApiData, document);
        documentParser.convert();
    }

}

export interface KubernetesOpenApiData
{
    openApiVersion: string;
    openApiV3Data?: Record<string, KubernetesOpenApiV3Response>;
    openApiV2Data?: KubernetesOpenApiV2Root;
}

export interface KubernetesApiData 
{
    resources: Record<string, string>
    definitions: Record<string, SchemaObject>
}

////

export interface KubernetesOpenApiResource
{
    group: string;
    kind: string;
    version: string;
}