/**
 * ConnectInstance inteface
 */
export interface ConnectInstance {
    instanceArn: string,
    instanceId: string
}

/**
 * ConnectInstance function
 * @description a simple construct to represent a AWS Connect instance
 * @remarks this could be replaced by a custom resource in the future
 * @param instanceArn the ARN of the AWS Connect instance
 * @returns an object containing the instanceArn and instanceId
 */
export default function(instanceArn: string) : ConnectInstance {
    return {
        instanceArn: instanceArn,
        instanceId: instanceArn.slice(-36) // AWS Connect instanceId is the last 36 characters of the instanceArn
    };
}