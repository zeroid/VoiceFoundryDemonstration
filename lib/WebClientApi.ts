import { Stack } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Function } from 'aws-cdk-lib/aws-lambda';

export default function WebClientApi(stack: Stack, recentHistoryFunction: Function, tryItFunction: Function) {
    const backendApi = new HttpApi(stack, 'WebClientApi', {
        description: 'Backend API for Voice Foundry demonstration',
        corsPreflight: {
            allowMethods: [
                CorsHttpMethod.OPTIONS,
                CorsHttpMethod.GET
            ],
            allowOrigins: ['*']
        }
    });

    backendApi.addRoutes({
        path: '/api/calls',
        methods: [HttpMethod.GET],
        integration: new HttpLambdaIntegration('GetTranslationIntegration', recentHistoryFunction)
    });

    backendApi.addRoutes({
        path: '/api/phonenumbers/{phoneNumber}/vanitynumbers',
        methods: [HttpMethod.GET],
        integration: new HttpLambdaIntegration('GetVanityPhoneNumbersIntegration', tryItFunction)
    })

    return backendApi;
}