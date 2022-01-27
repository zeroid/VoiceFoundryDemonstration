import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

import { Stack, RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

/**
 * FrontendWebClient
 * @param stack The stack for this deployment package
 * @returns The S3 Bucket resource that hosts the front end web client
 */
export default function WebClientBucket(stack: Stack) : Bucket {
    // ensure the React app is built
    var npm = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
    try {
        child_process.execSync(`${npm} run build`, {
            env: process.env,
            cwd: path.join(__dirname, '..', 'www'),
            stdio: 'inherit'
        });
    }
    catch (error) {
        throw new Error('Build process failed');
    }

    // create a bucket for web site hosting
    const bucket = new Bucket(stack, 'WebClientBucket', {
        autoDeleteObjects: true,
        //blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        publicReadAccess: true,
        removalPolicy: RemovalPolicy.DESTROY,
        websiteIndexDocument: 'index.html'
    });

    // deploy the React build directory
    const bucketDeployment = new BucketDeployment(stack, 'WebClientDeployment', {
        sources: [Source.asset('www/build')],
        destinationBucket: bucket
    });

    return bucket;
}