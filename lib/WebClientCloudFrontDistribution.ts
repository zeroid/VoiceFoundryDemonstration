import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { Stack } from "aws-cdk-lib";
import { CachePolicy, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, BucketPolicy } from "aws-cdk-lib/aws-s3";

/**
 * WebClientCloudFrontDistribution
 * @param stack 
 * @param frontEndWebClient The S3 Bucket resource that hosts the front end web application
 * @param backendApi The API Gateway resource that serves the API endpoints
 * @returns The Cloud Front resource for this deployment package
 */
export default function WebClientCloudFrontDistribution(stack: Stack, frontEndWebClient: Bucket, backendApi: HttpApi) {

    //const originAccessIdentity = new OriginAccessIdentity(stack, 'CloudFrontOriginAccessIdentity');
    //frontEndWebClient.grantRead(originAccessIdentity);
    
    const distribution = new Distribution(stack, "WebClientCloudFrontDistribution", {
        defaultBehavior: {
            origin: new S3Origin(frontEndWebClient, { /* originAccessIdentity: originAccessIdentity */ }),
            cachePolicy: CachePolicy.CACHING_DISABLED,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        },
        additionalBehaviors: {
            '/api/*': {
                origin: new HttpOrigin((backendApi.url as string).replace('https://', '').replace('/', '')),
                cachePolicy: CachePolicy.CACHING_DISABLED
            }
        }
    });

    return distribution;
} 