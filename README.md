# AWS TODO Management Project

GitHub: https://github.com/TanaySasane/MERN-and-AWS-Project

## Overview
This monorepo hosts an AWS-focused TODO web application that combines a React frontend with serverless backend services. It uses infrastructure-as-code to deploy a resilient, fully managed stack that can scale with user demand.

## Features
- Full CRUD flow for TODO items backed by AWS services.
- Real-time frontend updates powered by React Context API.
- Secure, user-aware APIs protected by Cognito authorizers.
- Static frontend hosting via S3 + CloudFront with global delivery.

## Technical Details

### Frontend
- **Technologies & Libraries**: React for interfaces, Tailwind CSS for utilities, and the React Context API for shared state across components.
- **Key Components**:
  - `TodoList`: Renders TODO entries and wires up create/update/delete actions.
  - `GlobalContext`: Manages TODO state, loading indicators, and error handling for the UI.

### Backend
- **Technologies & Libraries**: Node.js runtime hosting serverless logic, API Gateway as the HTTP façade, Cognito for identity, and Lambda functions for every business operation.
- **Lambda Functions**:
  - `CreateTodoLambda`: Persists new TODO data.
  - `GetTodosLambda`: Reads the list of TODOs.
  - `UpdateTodoLambda`: Applies edits to existing tasks.
  - `DeleteTodoLambda`: Removes tasks and cleans related metadata.
  - `GenPresignedUrlLambda`: Issues presigned S3 URLs for image uploads or attachments.

## Infrastructure
- **Tools**: AWS CDK defines stacks for compute, data, and networking resources.
- **Services**: DynamoDB stores TODO items, S3 hosts static assets, and CloudFront accelerates delivery.
- **Constructs**:
  - `BackendConstruct`: Configures Lambdas, API Gateway, and stage settings.
  - `DataBaseConstruct`: Builds DynamoDB tables with appropriate keys and indexes.
  - `S3Construct`: Creates buckets for hosting and uploads with lifecycle/security policies.

## Deployment
- CDK pipelines provision infrastructure and deploy Lambda code.
- S3 buckets host the compiled frontend, while CloudFront distributes it globally with SSL.
- CI/CD hooks rebuild and redeploy on commits to the main branch.

## Security
- Cognito user pools authenticate visitors, and API Gateway authorizers enforce scoped access.
- IAM roles follow the least privilege principle for each Lambda.
- Static assets served over HTTPS with CloudFront and custom domain support.

## Programming Techniques
- **Infrastructure as Code**: CDK keeps environment definition versioned alongside code.
- **Serverless Architecture**: Business logic lives in stateless Lambdas, reducing server maintenance.
- **Continuous Integration/Deployment**: Automated pipelines refresh both infra and application layers on push.

## Conclusion
This project showcases how to build a maintainable, scalable TODO experience entirely on AWS, pairing modern React tooling with serverless compute and secure infrastructure provisioning.
