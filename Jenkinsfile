pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                sshagent(['ec2-ssh']) {

                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@52.15.78.191 << 'EOF'

                    cd ~/Productivity-Checking-Game-FullStack

                    git checkout deployment
                    git pull origin deployment

                    docker stop dayforge || true
                    docker rm dayforge || true

                    docker build -t dayforge .

                    docker run -d \
                        --name dayforge \
                        -p 3000:3000 \
                        --env-file .env.production \
                        dayforge

                    EOF
                    '''
                }
            }
        }
    }
}