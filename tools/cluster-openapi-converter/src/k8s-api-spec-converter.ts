import { ILogger } from 'the-logger';
import { SchemaObject } from 'ajv';
import _ from 'lodash';

export class K8sApiSpecConverter
{
    private _logger : ILogger;
    private _openApiData: KubernetesOpenApiData;

    private _k8sApiData : KubernetesApiData = {
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
            for(const apiName of _.keys(this._openApiData.openApiV3Data))
            {
                const apiDocument = this._openApiData.openApiV3Data[apiName];
            }
        }

        return this._k8sApiData;
    }
}

export interface KubernetesOpenApiData
{
    openApiVersion: string;
    openApiV3Data?: any;
    openApiV2Data?: any;
}

export interface KubernetesApiData 
{
    definitions: Record<string, SchemaObject>
}