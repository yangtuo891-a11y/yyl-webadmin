<template>
  <div class="categories-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>类目管理</span>
          <el-button type="primary" @click="handleAdd(null)">新增一级类目</el-button>
        </div>
      </template>
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        row-key="categoryId" 
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="categoryId" label="ID" width="80" />
        <el-table-column label="类目图标" width="100">
          <template #default="scope">
            <template v-if="scope.row.categoryLevel === 1">
              <el-image 
                v-if="scope.row.categoryImageUrl" 
                :src="scope.row.categoryImageUrl" 
                style="width: 40px; height: 40px; border-radius: 4px;"
                fit="cover"
              />
              <span v-else class="no-image">无图标</span>
            </template>
            <span v-else class="no-icon-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="类目名称" />
        <el-table-column label="类目级别" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.categoryLevel === 1 ? 'primary' : 'success'">
              {{ scope.row.categoryLevel === 1 ? '一级类目' : '二级类目' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              v-if="scope.row.categoryLevel === 1" 
              size="small" 
              type="success" 
              @click="handleAdd(scope.row)"
            >
              添加子类目
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="类目名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入类目名称" />
        </el-form-item>
        <el-form-item label="父级类目" v-if="form.categoryLevel === 2">
          <el-select v-model="form.parentCategoryId" placeholder="请选择父级类目" style="width: 100%" disabled>
            <el-option 
              v-for="item in parentCategories" 
              :key="item.categoryId" 
              :label="item.categoryName" 
              :value="item.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类目级别">
          <el-radio-group v-model="form.categoryLevel" :disabled="isEdit">
            <el-radio :label="1">一级类目</el-radio>
            <el-radio :label="2" :disabled="!parentCategory">二级类目</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类目图标" v-if="form.categoryLevel === 1">
          <div class="upload-container">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
            >
              <img v-if="form.categoryImageUrl" :src="form.categoryImageUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tips">
              <p>建议尺寸：100x100像素</p>
              <p>支持格式：JPG、PNG</p>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/api/categoriesApi'
import { uploadImage } from '@/api/uploadApi'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const loading = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const parentCategory = ref(null)
const formRef = ref(null)

const form = ref({
  categoryId: null,
  categoryName: '',
  parentCategoryId: null,
  categoryLevel: 1,
  categoryImageUrl: ''
})

const rules = {
  categoryName: [
    { required: true, message: '请输入类目名称', trigger: 'blur' },
    { min: 1, max: 50, message: '类目名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 获取一级类目列表（用于选择父级类目）
const parentCategories = computed(() => {
  return tableData.value.filter(item => item.categoryLevel === 1)
})

// 构建树形数据结构
const buildTreeData = (data) => {
  const tree = []
  const map = {}
  
  // 先创建所有节点的映射
  data.forEach(item => {
    map[item.categoryId] = { ...item, children: [] }
  })
  
  // 构建树形结构
  data.forEach(item => {
    if (item.categoryLevel === 1) {
      tree.push(map[item.categoryId])
    } else if (item.parentCategoryId && map[item.parentCategoryId]) {
      map[item.parentCategoryId].children.push(map[item.categoryId])
    }
  })
  
  return tree
}

// 获取类目列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    tableData.value = buildTreeData(res)
  } catch (error) {
    ElMessage.error('获取类目列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = (parent = null) => {
  isEdit.value = false
  parentCategory.value = parent
  
  if (parent) {
    dialogTitle.value = '新增二级类目'
    form.value = {
      categoryId: null,
      categoryName: '',
      parentCategoryId: parent.categoryId,
      categoryLevel: 2,
      categoryImageUrl: null // 二级类目不需要图标
    }
  } else {
    dialogTitle.value = '新增一级类目'
    form.value = {
      categoryId: null,
      categoryName: '',
      parentCategoryId: null,
      categoryLevel: 1,
      categoryImageUrl: ''
    }
  }
  
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑类目'
  
  form.value = {
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    parentCategoryId: row.parentCategoryId,
    categoryLevel: row.categoryLevel,
    categoryImageUrl: row.categoryLevel === 1 ? (row.categoryImageUrl || '') : null
  }
  
  // 如果是二级类目，需要设置父级类目信息
  if (row.categoryLevel === 2 && row.parentCategoryId) {
    const parent = parentCategories.value.find(p => p.categoryId === row.parentCategoryId)
    parentCategory.value = parent
  }
  
  dialogVisible.value = true
}

const handleDelete = (row) => {
  // 检查是否有子类目
  if (row.categoryLevel === 1 && row.children && row.children.length > 0) {
    ElMessage.warning('该类目下还有子类目，请先删除子类目')
    return
  }
  
  ElMessageBox.confirm('确认删除该类目吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCategory(row.categoryId)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 文件上传前的校验
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 自定义上传方法
const handleUpload = async (options) => {
  const file = options.file
  
  try {
    const res = await uploadImage(file)
    if (res) {
      form.value.categoryImageUrl = res
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败，返回数据格式错误')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const submitData = {
      categoryName: form.value.categoryName,
      parentCategoryId: form.value.parentCategoryId,
      categoryLevel: form.value.categoryLevel,
      categoryImageUrl: form.value.categoryImageUrl
    }
    
    console.log('提交数据:', submitData)
    
    if (isEdit.value) {
      console.log('开始更新分类...')
      const result = await updateCategory(form.value.categoryId, submitData)
      console.log('更新结果:', result)
      ElMessage.success('修改成功')
    } else {
      console.log('开始添加分类...')
      const result = await addCategory(submitData)
      console.log('添加结果:', result)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('操作失败:', error)
    if (error !== false) { // 表单验证失败时error为false
      // 显示具体的错误信息，而不是通用的失败消息
      const errorMsg = error.message || (isEdit.value ? '修改失败' : '添加失败')
      ElMessage.error(errorMsg)
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.categories-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

.no-image {
  color: #999;
  font-size: 12px;
}

.upload-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
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
  border-color: #409eff;
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
  object-fit: cover;
}

.upload-tips {
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}

.upload-tips p {
  margin: 0;
}

.no-icon-text {
  color: #999;
  font-size: 14px;
  text-align: center;
  display: inline-block;
  width: 100%;
}

.no-image {
  color: #999;
  font-size: 12px;
  text-align: center;
  display: inline-block;
  width: 100%;
}
</style>