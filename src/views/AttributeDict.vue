<template>
  <div class="attribute-dict-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品属性管理</span>
          <el-button type="primary" @click="handleAdd">新增属性</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" row-key="id" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="attrName" label="属性描述" />
        <el-table-column prop="attrKey" label="属性字段名"/>
       
     
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="属性描述">
          <el-input v-model="form.attrName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="属性字段名">
            <el-input v-model="form.attrKey" placeholder="请输入属性字段名，只能用英文" />
          
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
import { getAttributeList, addAttribute, updateAttribute, deleteAttribute } from '@/api/attributeApi'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const loading = ref(false)
const form = ref({
  attrName: '',
  attrKey: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAttributeList()

    tableData.value = res
  } catch (error) {
    ElMessage.error('获取属性列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增属性'
  form.value = { attrName: '', attrKey: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑属性'
  form.value = {
    id: row.id,
    attrName: row.attrName,
    attrKey: row.attrKey
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该属性吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAttribute(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  try {
    const payload = {
        attrName: form.value.attrName,
        attrKey : form.value.attrKey,
        id: form.value.id
    }

    if (dialogTitle.value === '新增属性') {
      await addAttribute(payload)
      ElMessage.success('添加成功')
    } else {
      await updateAttribute(payload.id, payload)
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)

  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.attribute-dict-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>