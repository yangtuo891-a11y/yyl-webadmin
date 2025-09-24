<template>
  <div class="spec-dict-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>标签字典管理</span>
          <el-button type="primary" @click="handleAdd">新增标签</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" row-key="id" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="typeName" label="标签名称" />
        <el-table-column prop="typeValue" label="标签值" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标签名称">
          <el-input v-model="form.typeName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签值">
          <el-input v-model="form.typeValue" placeholder="请输入标签值" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSpecDictList, addSpecDict, updateSpecDict, deleteSpecDict } from '@/api/specDictApi'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const loading = ref(false)
const form = ref({
  typeName: '',
  typeValue: ''
})

// 获取标签字典列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSpecDictList()
    tableData.value = res
  } catch (error) {
    ElMessage.error('获取标签字典列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增标签'
  form.value = {
    typeName: '',
    typeValue: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑标签'
  form.value = {
    id: row.id,
    typeName: row.typeName,
    typeValue: row.typeValue
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该标签吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteSpecDict(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  try {
    if (dialogTitle.value === '新增标签') {
      await addSpecDict(form.value)
      ElMessage.success('添加成功')
    } else {
      await updateSpecDict(form.value.id, form.value)
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(dialogTitle.value === '新增标签' ? '添加失败' : '修改失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.spec-dict-container {
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
</style>