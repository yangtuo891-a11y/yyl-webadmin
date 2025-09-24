<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="login-logo">
          <img src="https://cdn-icons-png.flaticon.com/512/3724/3724763.png" alt="Logo" class="logo-image" />
          <h1 class="system-name">生鲜超市管理系统</h1>
        </div>
        <div class="login-slogan">
          <h2>高效管理，智能决策</h2>
          <p>为您的生鲜超市提供全方位的管理解决方案</p>
        </div>
      </div>
      <div class="login-right">
        <el-card class="login-card" shadow="never">
          <h2 class="login-title">管理员登录</h2>
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
            <el-form-item prop="adminId">
              <el-input
                v-model="loginForm.adminId"
                placeholder="请输入用户名"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="adminPwd">
              <el-input
                v-model="loginForm.adminPwd"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                style="width: 100%"
                @click="handleLogin"
                :loading="loading"
                size="large"
                color="#52c41a"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/authApi'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = ref({
  adminId: '',
  adminPwd: ''
})

const loginRules = {
  adminId: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  adminPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm.value)
        localStorage.setItem('token', res)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    } else {
      return false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  overflow: hidden;
}

.login-box {
  display: flex;
  width: 900px;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.login-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.logo-image {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.system-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  text-align: center;
}

.login-slogan {
  text-align: center;
}

.login-slogan h2 {
  font-size: 28px;
  margin-bottom: 16px;
}

.login-slogan p {
  font-size: 16px;
  opacity: 0.9;
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-card {
  border: none;
  box-shadow: none;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #52c41a;
  font-size: 24px;
  font-weight: bold;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e0e0e0 inset;
  padding: 0 15px;
  height: 50px;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #52c41a inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #52c41a inset;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-button) {
  height: 50px;
  font-size: 16px;
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
}
</style>