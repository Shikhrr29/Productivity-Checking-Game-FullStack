pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                bat '''
                ssh -o StrictHostKeyChecking=no -i "C:\\JenkinsKeys\\dayforge-key1.pem" ubuntu@ec2-52-15-78-191.us-east-2.compute.amazonaws.com ^
                "cd ~/Productivity-Checking-Game-FullStack && \
                git checkout deployment && \
                git pull origin deployment && \
                docker stop dayforge || true && \
                docker rm dayforge || true && \
                docker build -t dayforge . && \
                docker run -d --name dayforge -p 3000:3000 --env-file .env.production dayforge"
                '''
            }
        }
    }
}