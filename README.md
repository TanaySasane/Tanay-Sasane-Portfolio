# TODO Web App

## Overview
This monorepo hosts a MERN stack TODO web application built for AWS, following modern architecture patterns to keep the system scalable, secure, and easy to operate.

## Features
- Create, retrieve, update, and delete TODO tasks through a polished UI.
- Real-time frontend updates driven by React Context and utility-driven styling.
- Secure, scalable hosting on AWS (Lambda, API Gateway, CloudFront) for global reach.

## Technical Details

### Frontend
- **Technologies & Libraries**: React, Tailwind CSS, and the React Context API for shared state management.
- **Key Components**:
  - `TodoList`: Renders the task list and wires up create/update/delete interactions.
  - `GlobalContext`: Maintains TODO data, loading states, and error handling across the UI.

### Backend
- **Technologies & Libraries**: Node.js, AWS Lambda, API Gateway, and Amazon Cognito.
- **Lambda Functions**:
  - `CreateTodoLambda`: Persists new tasks.
  - `GetTodosLambda`: Returns the current task list.
  - `UpdateTodoLambda`: Applies edits to existing TODOs.
  - `DeleteTodoLambda`: Removes tasks safely.
  - `GenPresignedUrlLambda`: Issues presigned S3 URLs for optional uploads.

## Infrastructure
- **Tools & Services**: AWS CDK, DynamoDB, S3, and CloudFront.
- **Key Constructs**:
  - `BackendConstruct`: Boots Lambda functions, API Gateway stages, and authorizers.
  - `DataBaseConstruct`: Builds DynamoDB tables with the right keys and indexes.
  - `S3Construct`: Creates buckets for static hosting and asset uploads.

## Deployment
- Frontend assets are hosted on S3 and delivered globally through CloudFront.
- API routes are exposed via API Gateway backed by Lambda logic.
- CI/CD pipelines (CDK/CodePipeline) rebuild and redeploy on commit to the main branch.

## Security
- Amazon Cognito manages authentication/authorization for users.
- API Gateway authorizers enforce Cognito policies before hitting Lambda.
- IAM roles follow the least-privilege principle for every serverless component.

## Programming Techniques
- **Infrastructure as Code (IaC)**: AWS CDK keeps infrastructure definition versioned alongside the app code.
- **Serverless Architecture**: Business logic lives in stateless Lambdas to avoid server maintenance.
- **Continuous Integration/Deployment**: Automated pipelines refresh both infra and application layers on every push.

## Conclusion
This project demonstrates how to deliver a maintainable, scalable TODO experience by combining React, serverless APIs, and AWS-managed networking in one cohesive solution.
