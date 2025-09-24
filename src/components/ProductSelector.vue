<template>
  <el-dialog
    v-model="visible"
    title="选择商品"
    width="80%"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <div class="product-selector">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
          </el-form-item>
          <el-form-item label="商品类目" style="width: 300px;">
            <el-select v-model="searchForm.categoryId" placeholder="请选择商品类目" clearable>
              <el-option label="全部" value="" />
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productId" label="商品ID" width="80" />
        <el-table-column prop="categoryName" label="类目名称" width="120" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="productPicture" label="商品图片" width="120">
          <template #default="scope">
            <el-image
              style="width: 50px; height: 50px"
              :src="processImageUrl(scope.row.productPicture)"
              :preview-src-list="[scope.row.productPicture]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="spu0Price" label="商品价格" width="120">
          <template #default="scope">
            <span>¥{{ scope.row.spu0Price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="num" label="库存" width="80" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProductListBySelector } from '@/api/productsApi'
import { getCategoryList } from '@/api/categoriesApi'
import { processImageUrl } from '@/utils/imageUtils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedProducts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const selectedRows = ref([])

const searchForm = ref({
  name: '',
  categoryId: ''
})

const categories = ref([])

const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.map(item => ({
      label: item.categoryName,
      value: item.categoryId
    }))
  } catch (error) {
    console.error('获取类目列表失败:', error)
    ElMessage.error('获取类目列表失败')
  }
}

onMounted(() => {
  fetchCategories()
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      productName: searchForm.value.name,
      ...searchForm.value
    }
    const res = await getProductListBySelector(params)
    tableData.value = res.records || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}



const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }
  emit('confirm', selectedRows.value)
  visible.value = false
}

const handleClose = () => {
  selectedRows.value = []
  emit('update:modelValue', false)
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      fetchData()
    }
  }
)

// 监听visible变化
watch(
  () => visible.value,
  (val) => {
    emit('update:modelValue', val)
  }
)
</script>

<style scoped>
.product-selector {
  padding: 20px 0;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>