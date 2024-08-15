# Use an official Node.js runtime as a parent image
FROM public.ecr.aws/lambda/nodejs:20

# Set the working directory in the container

# Copy the package.json and package-lock.json files to the working directory
COPY . ${LAMBDA_TASK_ROOT}/

RUN npm install typings --global
# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory

# Set the working directory to the lambdas folder

# Command to run the Lambda function locally (for example, using AWS SAM CLI)
CMD ["auth.register"]