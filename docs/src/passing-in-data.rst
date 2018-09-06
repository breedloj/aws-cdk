.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _passing_in_data:

##########################################
Passing in External Data to Your |cdk| App
##########################################

.. See https://github.com/awslabs/aws-cdk/issues/603 (includes work from the following PR)
       https://github.com/awslabs/aws-cdk/pull/183

There may be cases where you want to parameterize one or more of your stack resources.
Therefore, you want to be able to pass data into your app from outside your app.
Currently, you can get data into your app from outside your app through any of the following.

- Using a context variable
- Using an environment variable
- Using an SSM Parameter Store variable
- Using a value from another stack
- Using a |CFN| parameter

Each of these techniques is described in the following sections.

.. _passing_in_data_from_context:

Getting a Value from a Context Variable
=======================================

You can specify a context variable either as
part of a |toolkit| command,
or in a **context** section of *cdk.json*.

To pass the value of a context value to your app on the command line,
run a |toolkit| command using the **--context** (**-c**) option,
as shown in the following example.

.. code-block:: sh

    cdk synth -c bucket_name=mygroovybucket

To specify the same context variable in *cdk.json*:

.. code-block:: json

    {
        "context": {
            "bucket_name": "myotherbucket"
        }
    }

To get the value of a command-line context value in your app,
use code like the following,
which gets the value of the context variable **bucket_name**.

.. code-block:: ts

    const bucket_name string = this.getContext("bucket_name");

.. _passing_in_data_from_env_vars:

Getting a Value from an Environment Variable
============================================

To get the value of an environment variable,
use code like the following,
which gets the value of the environment variable **MYBUCKET**.

.. code-block:: ts

    const bucket_name = process.env.MYBUCKET;

.. _passing_in_data_from_ssm:

Getting a Value from an SSM Store Variable
==========================================

To get the value of an SSM parameter store variable,
use code like the following,
which uses the value of the SSM variable **my-awesome-value**.

.. code-block:: ts

    const myvalue = new SSMParameterProvider(this).getString("my-awesome-value");

See the :doc:`context` topic for information about the :py:class:`SSMParameterProvider <@aws-cdk/cdk.SSMParameterProvider>`.

.. _passing_in_data_between_stacks:

Passing in Data From Another Stack
==================================

You can pass data from one stack to another stack in the same app
by using the **export** method in one stack and the **import** method in the other stack.

The following example creates a bucket on one stack
and passes a reference to the other stack through an interface.

First create a stack with a bucket.
The stack includes a a property we use to pass the bucket's properties to the other stack.
Note how we use the **export** method on the bucket to get it's properties and save them
in the stack property.

.. code-block:: ts

    class HelloCdkStack extends cdk.Stack {
        // Property that defines the stack you are exporting from
        public readonly myBucketRefProps: s3.BucketRefProps;

	constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
            super(parent, name, props);

            const mybucket = new s3.Bucket(this, "MyFirstBucket");

            // Save bucket's *BucketRefProps*
            this.myBucketRefProps = mybucket.export();
	}
    }

Next create another stack that gets a reference to the other bucket
from the properties passed in through the constructor.

.. code-block:: ts

    // The class for the other stack
    class MyCdkStack extends cdk.Stack {
        constructor(parent: cdk.App, name: string, props: XferBucketProps) {
            super(parent, name);

            const myOtherBucket = s3.Bucket.import(this, "MyOtherBucket", props.theBucketRefProps);

	    // Do something with myOtherBucket
        }
    }

Create an interface for the second stack's properties.
We use this interface to pass the bucket properties between the two stacks.

.. code-block:: ts

    // Interface we'll use to pass the bucket's properties to another stack
    interface XferBucketProps {
        theBucketRefProps: s3.BucketRefProps;
    }

Finally, connect the dots in your app.

.. code-block:: ts

    const app = new cdk.App(process.argv);

    const myStack = new HelloCdkStack(app, "HelloCdkStack");

    new MyCdkStack(app, "MyCdkStack", {
        theBucketRefProps: myStack.myBucketRefProps
    });

    process.stdout.write(app.run());

.. _using_cfn_parameter:

Using an |CFN| Parameter
========================

See the
`Parameters <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html>`_
topic for information about using the optional *Parameters* section to customize your |CFN| templates.

You can also get a reference to a resource in an existing |CFN| template,
as described in :doc:`concepts`.
