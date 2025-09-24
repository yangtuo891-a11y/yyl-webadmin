pipeline {
    agent any
    
    environment {
        PROJECT_NAME = 'hadluo-shop-webadmin'
        PROJECT_PATH = '/opt/projects/hadluo-shop-webadmin'  // 服务器上的项目路径
        DEPLOY_PATH = '/var/www/html/admin'  // 部署到8081端口对应的目录
        NODE_VERSION = '18'
        BUILD_SOURCE = 'webadmin'  // 标识这是管理端构建
    }
    
    stages {
        stage('Prepare') {
            steps {
                echo '=== 开始准备管理端构建环境 ==='
                script {
                    // 检查项目目录
                    sh "echo '当前工作目录:' && pwd"
                    sh "echo '检查项目目录:' && ls -la ${PROJECT_PATH}"
                    
                    // 验证这是管理端项目
                    sh """
                        echo '验证项目类型...'
                        if [ -f "${PROJECT_PATH}/package.json" ]; then
                            PROJECT_NAME_CHECK=\$(grep '"name"' ${PROJECT_PATH}/package.json | grep 'webadmin')
                            if [ -n "\$PROJECT_NAME_CHECK" ]; then
                                echo '✅ 确认这是管理端项目 (webadmin)'
                            else
                                echo '❌ 错误：这不是管理端项目！'
                                cat ${PROJECT_PATH}/package.json | grep '"name"'
                                exit 1
                            fi
                        else
                            echo '❌ 错误：找不到package.json文件！'
                            echo '项目路径: ${PROJECT_PATH}'
                            ls -la ${PROJECT_PATH}/ || echo '项目目录不存在'
                            exit 1
                        fi
                    """
                    
                    // 检查Node.js版本
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '=== 安装依赖包 ==='
                script {
                    // 检查是否需要安装依赖
                    def nodeModulesExists = sh(
                        script: "test -d ${PROJECT_PATH}/node_modules && echo 'exists' || echo 'not_exists'",
                        returnStdout: true
                    ).trim()
                    
                    if (nodeModulesExists == 'not_exists') {
                        echo '安装npm依赖...'
                        sh "cd ${PROJECT_PATH} && npm install"
                    } else {
                        echo 'node_modules已存在，跳过安装'
                    }
                    
                    // 确保可执行权限
                    sh "chmod +x ${PROJECT_PATH}/node_modules/.bin/* 2>/dev/null || true"
                }
            }
        }
        
        stage('Build') {
            steps {
                echo '=== 构建项目 ==='
                script {
                    echo '开始构建...'
                    sh "cd ${PROJECT_PATH} && npm run build"
                    echo '构建完成'
                    
                    // 检查构建结果
                    sh "ls -la ${PROJECT_PATH}/dist/"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo '=== 部署项目 ==='
                script {
                    echo '开始部署...'
                    
                    // 检查dist目录
                    sh """
                        if [ ! -d "${PROJECT_PATH}/dist" ]; then
                            echo "错误：dist目录不存在，无法部署"
                            exit 1
                        fi
                        echo "✅ dist目录存在，准备部署"
                        ls -la ${PROJECT_PATH}/dist/
                    """
                    
                    // 创建部署目录并设置权限
                    sh """
                        echo '创建部署目录...'
                        sudo mkdir -p ${DEPLOY_PATH}
                        sudo chown -R jenkins:jenkins ${DEPLOY_PATH}
                    """
                    
                    // 清理旧文件
                    sh """
                        echo '清理旧的部署文件...'
                        sudo rm -rf ${DEPLOY_PATH}/*
                    """
                    
                    // 复制文件到部署目录
                    sh """
                        echo '复制文件到部署目录...'
                        sudo cp -r ${PROJECT_PATH}/dist/* ${DEPLOY_PATH}/
                        sudo chown -R nginx:nginx ${DEPLOY_PATH}
                        sudo chmod -R 755 ${DEPLOY_PATH}
                        echo '部署完成'
                    """
                    
                    // 验证部署
                    sh """
                        echo '验证部署结果:'
                        ls -la ${DEPLOY_PATH}/
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '=== 健康检查 ==='
                script {
                    // 检查部署文件
                    sh """
                        echo "检查部署目录："
                        ls -la ${DEPLOY_PATH}
                        
                        echo "检查index.html文件："
                        if [ -f "${DEPLOY_PATH}/index.html" ]; then
                            echo "✅ index.html 存在"
                            head -5 ${DEPLOY_PATH}/index.html
                        else
                            echo "❌ index.html 不存在"
                            exit 1
                        fi
                        
                        echo "验证部署内容是否为管理端应用："
                        if grep -q "Hadluo Shop Admin\\|webadmin\\|管理系统\\|admin\\|管理端\\|后台" ${DEPLOY_PATH}/index.html; then
                            echo "✅ 确认部署的是管理端应用"
                            echo "应用标题："
                            grep -o "<title>.*</title>" ${DEPLOY_PATH}/index.html || echo "未找到title标签"
                        else
                            echo "❌ 警告：部署的可能不是管理端应用"
                            echo "index.html内容预览："
                            head -20 ${DEPLOY_PATH}/index.html
                            echo "查找的关键词：Hadluo Shop Admin, webadmin, 管理系统, admin, 管理端, 后台"
                        fi
                        
                        echo "检查assets目录："
                        if [ -d "${DEPLOY_PATH}/assets" ]; then
                            echo "✅ assets目录存在"
                            ls -la ${DEPLOY_PATH}/assets/ | head -10
                        else
                            echo "❌ assets目录不存在"
                            exit 1
                        fi
                    """
                    
                    // 检查Nginx状态
                    sh 'sudo systemctl status nginx --no-pager -l'
                }
            }
        }
    }
    
    post {
        always {
            echo '=== 构建流程完成 ==='
            script {
                // 显示构建摘要
                sh """
                    echo "==================== 构建摘要 ===================="
                    echo "项目名称: ${PROJECT_NAME}"
                    echo "构建时间: \$(date)"
                    echo "部署路径: ${DEPLOY_PATH}"
                    echo "访问地址: http://192.168.1.120:8081"
                    echo "================================================="
                """
            }
        }
        success {
            echo '✅ 管理端构建部署成功！'
            script {
                sh """
                    echo "🎉 管理端已成功部署到服务器！"
                    echo "📱 访问地址: http://192.168.1.120:8081"
                    echo "📁 部署目录: ${DEPLOY_PATH}"
                """
            }
        }
        failure {
            echo '❌ 管理端构建部署失败！'
            script {
                sh """
                    echo "💥 构建失败，请检查以下内容："
                    echo "1. 项目源码是否正确"
                    echo "2. 依赖包是否安装成功"
                    echo "3. 构建命令是否执行成功"
                    echo "4. 部署权限是否正确"
                """
            }
        }
    }
}