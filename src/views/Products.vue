<template>
  <div class="products-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">新增商品</el-button>
        </div>
      </template>
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
          </el-form-item>
          <el-form-item label="商品类目" style="width: 300px;">
            <el-select v-model="searchForm.categoryId" placeholder="请选择商品类目" clearable>
              <el-option label="全部" value="" />
              <el-option
                v-for="item in categoryOptions"
                :key="item.categoryId"
                :label="item.categoryName"
                :value="item.categoryId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品状态" style="width: 200px;">
            <el-select v-model="searchForm.state" placeholder="请选择商品状态" clearable>
              <el-option label="上架" value="0" />
              <el-option label="下架" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedProducts.length === 0">删除选中</el-button>
            <el-button type="danger" plain @click="handleDeleteAll">删除全部</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productId" label="ID" width="80" />
        <el-table-column prop="productName" label="商品名称" min-width="200">
          <template #default="scope">
            <div class="product-info">
              <el-image :src="processImageUrl(scope.row.productPicture)" style="width: 50px; height: 50px" />
              <span class="product-name">{{ scope.row.productName }}</span>
            </div>
          </template>
        </el-table-column>
       
        <el-table-column prop="categoryName" label="商品类目" />
        <el-table-column label="价格" width="180">
          <template #default="scope">
            <div>
              <div>¥{{ scope.row.spu0Price }}</div>
     
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存/销量" width="120">
          <template #default="scope">
            <div>
              <div>库存：{{ scope.row.productNum }}</div>
              <div>销量：{{ scope.row.productSales }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="商品类目" />
        <el-table-column prop="skuConfigNames" label="标签字典">
          <template #default="scope">
            <el-tag
              v-for="(item, index) in scope.row.skuConfigNames?.split(',') || []"
              :key="index"
              class="mx-1"
              size="small"
              type="info"
            >
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="上下架" width="100">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.state === 0"
              @update:model-value="(val) => handleToggleStatus(scope.row, val ? 0 : 1)"
              active-text="上架"
              inactive-text="下架"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="() => router.push(`/products/edit/${scope.row.productId}`)">编辑</el-button>
            <el-button size="small" type="primary" @click="handleViewSpu(scope.row)">规格管理</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.productTitle" placeholder="请输入副标题" />
        </el-form-item>
        <el-form-item label="商品类目">
          <el-select v-model="form.categoryId" placeholder="请选择商品类目">
            <el-option label="测试类目" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            class="avatar-uploader"
            :http-request="handleUpload"
            :show-file-list="false"
          >
            <img v-if="form.productPicture" :src="processImageUrl(form.productPicture)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="售价">
          <el-input-number v-model="form.spu0Price" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="销量">
          <el-input-number v-model="form.productSales" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.productNum" :min="0" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input
            v-model="form.productIntro"
            type="textarea"
            rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="form.state" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>


    <!-- SPU规格管理对话框 -->
<el-dialog v-model="spuDialogVisible" title="规格管理" width="800px">
  <el-table :data="spuList" style="width: 100%">
    <el-table-column prop="spuName" label="规格名称">
      <template #default="scope">
        <el-input v-model="scope.row.spuName" placeholder="请输入规格名称" size="small" />
      </template>
    </el-table-column>
    <el-table-column prop="spuValue" label="规格值">
      <template #default="scope">
        <el-input v-model="scope.row.spuValue" placeholder="请输入规格值" size="small" />
      </template>
    </el-table-column>
    <el-table-column prop="spuPrice" label="售价">
      <template #default="scope">
        <el-input-number v-model="scope.row.spuPrice" :min="0" :precision="2" size="small" />
      </template>
    </el-table-column>
    <el-table-column prop="spuStock" label="库存">
      <template #default="scope">
        <el-input-number v-model="scope.row.spuStock" :min="0" size="small" :disabled="scope.row.id" />
      </template>
    </el-table-column>
    <el-table-column prop="state" label="状态">
      <template #default="scope">
        <el-switch v-model="scope.row.state" :active-value="0" :inactive-value="1" />
      </template>
    </el-table-column>
    <el-table-column label="操作" width="150">
      <template #default="scope">
        <el-button size="small" type="primary" @click="handleSaveSpu(scope.row)">保存</el-button>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin-top: 20px;">
    <el-button type="primary" @click="handleAddSpu">新增规格</el-button>
  </div>
</el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList, addProduct, updateProduct, deleteProduct, updateProductStatus, getProductSpuList, updateProductSpu, addProductSpu, deleteProductSpu } from '@/api/productsApi'
import { getCategoryList } from '@/api/categoriesApi'
import { uploadImage } from '@/api/uploadApi'
import { processImageUrl } from '@/utils/imageUtils'


const router = useRouter()

const searchForm = ref({
  productName: '',
  categoryId: '',
  state: ''
})

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const categoryOptions = ref([])
const selectedProducts = ref([]) // 选中的商品列表

const form = ref({
  productId: '',
  productName: '',
  productTitle: '',
  categoryId: '',
  productPicture: '',
  productPrice: 0,
  productSellingPrice: 0,
  productNum: 0,
  productSales: 0,
  productIntro: '',
  state: 0
})

// SPU对话框相关数据
const spuDialogVisible = ref(false)
const currentProduct = ref(null)
const spuList = ref([])
const spuForm = ref({
  id: '',
  productId: '',
  spuName: '',
  spuValue: '',
  spuPrice: 0,
  spuStock: 0,
  state: 0
})

// 获取商品列表数据
const fetchData = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    }
    const res = await getProductList(params)
    tableData.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  }
}

// 获取商品分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categoryOptions.value = res
  } catch (error) {
    ElMessage.error('获取商品分类失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.value = {
    productName: '',
    categoryId: '',
    state: ''
  }
  currentPage.value = 1
  fetchData()
}

const handleAdd = () => {
  const route = router.resolve({ path: '/products/edit/new' })
  window.open(route.href, '_blank')
}

const handleEdit = (row) => {
  router.push(`/products/edit/${row.productId}`)
}

const handleToggleStatus = async (row, newStatus) => {
  try {
    await updateProductStatus(row.productId, newStatus)
    ElMessage.success(`商品${newStatus === 0 ? '上架' : '下架'}成功`)
    fetchData()
  } catch (error) {
    row.status = newStatus === 1 ? 0 : 1 // 恢复原状态
    ElMessage.error(`商品${newStatus === 0 ? '上架' : '下架'}失败`)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteProduct(row.productId)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 批量删除选中商品
const handleBatchDelete = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  
  ElMessageBox.confirm(`确认删除选中的 ${selectedProducts.value.length} 个商品吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const deletePromises = selectedProducts.value.map(product => 
        deleteProduct(product.productId)
      )
      await Promise.all(deletePromises)
      ElMessage.success(`成功删除 ${selectedProducts.value.length} 个商品`)
      selectedProducts.value = []
      fetchData()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  })
}

// 删除全部商品
const handleDeleteAll = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('当前没有商品可删除')
    return
  }
  
  ElMessageBox.confirm(`确认删除当前页面的所有 ${tableData.value.length} 个商品吗？此操作不可恢复！`, '删除全部', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  }).then(async () => {
    try {
      const deletePromises = tableData.value.map(product => 
        deleteProduct(product.productId)
      )
      await Promise.all(deletePromises)
      ElMessage.success(`成功删除 ${tableData.value.length} 个商品`)
      selectedProducts.value = []
      fetchData()
    } catch (error) {
      ElMessage.error('删除全部商品失败')
    }
  })
}

// 查看SPU规格
const handleViewSpu = async (row) => {
  currentProduct.value = row
  spuDialogVisible.value = true
  try {
    const res = await getProductSpuList(row.productId)
    spuList.value = res
  } catch (error) {
    ElMessage.error('获取规格列表失败')
  }
}

// 保存SPU规格
const handleSaveSpu = async (row) => {
  try {
    if (row.id) {
      await updateProductSpu(row.id, row)
    } else {
      await addProductSpu({ ...row, productId: currentProduct.value.productId })
    }
    ElMessage.success('保存成功')
    const res = await getProductSpuList(currentProduct.value.productId)
    spuList.value = res
  } catch (error) {
    console.error(error)
  }
}

// 删除SPU规格
const handleDeleteSpu = async (row) => {
  try {
    await deleteProductSpu(row.id)
    ElMessage.success('删除成功')
    const res = await getProductSpuList(currentProduct.value.productId)
    spuList.value = res
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 新增SPU规格
const handleAddSpu = () => {
  spuList.value.push({
    productId: currentProduct.value.productId,
    spuName: '',
    spuValue: '',
    spuPrice: 0,
    spuStock: 0,
    state: 0
  })
}


const handleSubmit = async () => {
  try {
    if (form.value.productId) {
      await updateProduct(form.value.productId, form.value)
      ElMessage.success('更新成功')
    } else {
      await addProduct(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(form.value.productId ? '更新失败' : '添加失败')
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleUpload = async (options) => {
  try {
    const formData = new FormData()
    formData.append('file', options.file)
    const res = await uploadImage(formData)
    form.value.productPicture = res.data.url
    options.onSuccess()
  } catch (error) {
    options.onError()
    ElMessage.error('上传失败')
  }
}

onMounted(() => {
  fetchData()
  fetchCategories()
})
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-name {
  margin-left: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409EFF;
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
</style>

