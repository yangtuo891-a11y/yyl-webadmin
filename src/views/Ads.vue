<template>
  <div class="ads-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>广告位管理</span>
          <el-button type="primary" @click="handleAdd">新增广告</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="carouselId" label="ID" width="80" />
        <el-table-column prop="imgPath" label="图片">
          <template #default="scope">
            <el-image style="width: 100px; height: 60px" :src="scope.row.imgPath" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="describes" label="描述" />
        <el-table-column prop="link" label="跳转链接" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 广告编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="图片">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
          >
            <img v-if="form.imgPath" :src="form.imgPath" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.describes" type="textarea" rows="3" placeholder="请输入广告描述" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.link" placeholder="请输入跳转链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdsList, addAd, updateAd, deleteAd } from '@/api/adsApi'
import { uploadImage } from '@/api/uploadApi'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({
  imgPath: '',
  describes: '',
  link: ''
})

// 获取广告列表
const fetchData = async () => {
  try {
    const res = await getAdsList()
    tableData.value = res
  } catch (error) {
    ElMessage.error('获取广告列表失败')
  }
}

// 处理图片上传
const handleUpload = async (options) => {
  try {
    const res = await uploadImage(options.file)
    form.value.imgPath = res
    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error('图片上传失败')
  }
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 新增广告
const handleAdd = () => {
  form.value = {
    imgPath: '',
    describes: '',
    link: ''
  }
  dialogTitle.value = '新增广告'
  dialogVisible.value = true
}

// 编辑广告
const handleEdit = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑广告'
  dialogVisible.value = true
}

// 删除广告
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该广告吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAd(row.carouselId)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (dialogTitle.value === '新增广告') {
      await addAd(form.value)
      ElMessage.success('添加成功')
    } else {
      await updateAd(form.value.carouselId, form.value)
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(dialogTitle.value === '新增广告' ? '添加失败' : '修改失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.ads-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}
</style>