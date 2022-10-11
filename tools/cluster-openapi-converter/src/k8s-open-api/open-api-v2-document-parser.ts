import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { KubernetesApiData } from './k8s-api-spec-converter';
import { BaseOpenApiDocumentParser } from './base-open-api-document-parser';
import { KubernetesOpenApiV2Root } from 'k8s-super-client';

export class OpenApiV2DocumentParser extends BaseOpenApiDocumentParser
{
    private _document: KubernetesOpenApiV2Root;

    constructor(logger: ILogger,
                k8sApiData : KubernetesApiData,
                document: KubernetesOpenApiV2Root)
    {
        super(logger, k8sApiData, document.definitions)
        this._document = document;
    }

    convert()
    {
        for(const path of _.keys(this._document.paths))
        {
            const pathDict = this._document.paths[path];
            const methodDict = pathDict['post'];
            if (methodDict)
            {
                if (methodDict['x-kubernetes-action'] === 'post')
                {
                    const apiResource = methodDict['x-kubernetes-group-version-kind'];
                    if (apiResource)
                    {
                        if (methodDict.parameters)
                        {
                            const bodyParameter = _.find(methodDict.parameters, x => x.name === 'body');
                            if (bodyParameter)
                            {
                                const reference = bodyParameter.schema['$ref'];
                                if (reference) {
                                    this._convertApiResource(path, apiResource, reference);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}
