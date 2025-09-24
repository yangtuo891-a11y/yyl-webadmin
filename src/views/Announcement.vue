<template>
  <div class="announcement-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>资讯管理</span>
          <el-button type="primary" @click="handleAdd">新增资讯</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="资讯标题" min-width="200" />

        <el-table-column prop="createTime" label="发布时间" width="180" />
       
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="资讯标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入资讯标题" />
        </el-form-item>
        <el-form-item label="资讯内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入资讯内容"
          />
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticleList, addArticle, updateArticle, deleteArticle,getArticleDetail } from '@/api/articleApi'

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const currentPage = ref(1)
const pageSize = ref(10)



const form = reactive({
  id: null,
  title: '',
  content: '',
  status: 0
})



const rules = {

}



const handleAdd = () => {
  dialogTitle.value = '新增资讯'
  Object.assign(form, {
    id: null,
    title: '',
    content: '',
    status: 0
  })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    dialogTitle.value = '编辑资讯'
    const res = await getArticleDetail(row.id)
    Object.assign(form, res)
    dialogVisible.value = true
  } catch (error) {
    console.error(error)

  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteArticle(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error(error)
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (form.id) {
      await updateArticle(form)
    } else {
      await addArticle(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const fetchData = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    const res = await getArticleList(params)
    tableData.value = res.records
    total.value = res.total
  } catch (error) {
    console.error(error)
  }
}

// 初始化加载数据
fetchData()
</script>

<style scoped>
.announcement-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>