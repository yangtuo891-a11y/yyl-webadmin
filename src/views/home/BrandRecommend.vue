<template>
  <div class="brand-recommend-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>品牌推荐管理</span>
          <el-button type="primary" @click="handleAdd">添加品牌</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column label="图片" width="180">
          <template #default="scope">
            <el-image
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="cover"
              style="width: 100px; height: 100px"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
      >
        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
          <el-form-item label="名称" prop="name">
            <el-select v-model="form.name" placeholder="请选择品牌名称" style="width: 100%">
              <el-option
                v-for="name in brandNames"
                :key="name"
                :label="name"
                :value="name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="图片" prop="image">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :http-request="handleUpload"
              :before-upload="beforeUpload"
            >
              <img v-if="form.image" :src="form.image" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadImage } from '@/api/uploadApi'
import { getBrandRecommends, addBrandRecommend, updateBrandRecommend, deleteBrandRecommend, getBrandNames } from '@/api/indexApi'

// 表格数据
const tableData = ref([])

// 品牌名称列表
const brandNames = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  image: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  image: [{ required: true, message: '请上传图片', trigger: 'change' }]
}

// 添加品牌
const handleAdd = () => {
  dialogTitle.value = '添加品牌'
  dialogVisible.value = true
  Object.assign(form, { id: null, name: '', image: '' })
}

// 编辑品牌
const handleEdit = (row) => {
  dialogTitle.value = '编辑品牌'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除品牌
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该品牌吗？', '提示', {
      type: 'warning'
    })
    await deleteBrandRecommend(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await updateBrandRecommend(form)
        } else {
          await addBrandRecommend(form)
        }
        ElMessage.success(form.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 上传图片相关
const handleUpload = async ({ file }) => {
  try {
    const response = await uploadImage(file)
    form.image = response
  } catch (error) {
    ElMessage.error('上传图片失败')
    console.error('上传失败:', error)
  }
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 加载数据
const loadData = async () => {
  try {
    const res = await getBrandRecommends()
    tableData.value = res || []
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 加载品牌名称列表
const loadBrandNames = async () => {
  try {
    const res = await getBrandNames()
    brandNames.value = res || []
  } catch (error) {
    console.error('加载品牌名称列表失败:', error)
    ElMessage.error('加载品牌名称列表失败')
  }
}

// 初始加载
loadData()
loadBrandNames()
</script>

<style scoped>
.brand-recommend-container {
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
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>