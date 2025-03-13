import * as cdk from 'aws-cdk-lib';
import { Bucket, StorageClass } from 'aws-cdk-lib/aws-s3'; // Correct import for s3.StorageClass
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb'; // Correct import for dynamodb.BillingMode
import { Construct } from 'constructs';

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the QA S3 bucket with a lifecycle rule
    const qaBucket = new Bucket(this, 'QATerraformStateBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [{
        enabled: true,
        transitions: [
          {
            storageClass: StorageClass.INFREQUENT_ACCESS,  // Use StorageClass directly
            transitionAfter: cdk.Duration.days(30),
          },
        ],
      }],
    });

    // Create the Prod DynamoDB table for state locking
    const prodTable = new Table(this, 'ProdTerraformStateTable', {
      partitionKey: { name: 'LockID', type: AttributeType.STRING },
      tableName: 'TerraformStateTableProd',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,  // Use BillingMode directly
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'QABucketName', {
      value: qaBucket.bucketName,
      description: 'S3 bucket for storing QA Terraform state',
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'ProdTableName', {
      value: prodTable.tableName,
      description: 'DynamoDB table for storing Prod Terraform state',
    });
  }
}
