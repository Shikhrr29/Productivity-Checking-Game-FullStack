pipeline {
    agent any

    stages {
        stage('Test SSH') {
            steps {
                withCredentials([file(credentialsId: 'ec2-pem', variable: 'PEMFILE')]) {
                    bat '''
                    ssh -o StrictHostKeyChecking=no -i "%PEMFILE%" ubuntu@ec2-52-15-78-191.us-east-2.compute.amazonaws.com "echo SSH_SUCCESS"
                    '''
                }
            }
        }
    }
}