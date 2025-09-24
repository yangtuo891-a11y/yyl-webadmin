<template>
  <div class="product-edit-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑商品' : '新增商品' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.productTitle" placeholder="请输入副标题" />
        </el-form-item>
        <el-form-item label="商品类目">
          <el-cascader
            v-model="form.categoryPath"
            :options="categoryOptions"
            :props="{
              value: 'categoryId',
              label: 'categoryName',
              children: 'children',
              emitPath: false,
              checkStrictly: false
            }"
            placeholder="请选择商品类目"
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="标签字典">
          <el-select v-model="form.skuConfigIds" placeholder="请选择标签字典" multiple>
            <el-option
              v-for="item in specDictOptions"
              :key="item.id"
              :label="`${item.typeName} - ${item.typeValue}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品封面">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :http-request="handleUpload"
          >
            <img v-if="form.productPicture" :src="processImageUrl(form.productPicture)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="商品图片">
          <el-upload
            class="product-images-uploader"
            action="/api/upload"
            list-type="picture-card"
            :http-request="handleProductImagesUpload"
            :on-remove="handleRemove"
            :file-list="form.productImages.map(url => ({
              url,
              name: url.split('/').pop()
            }))"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item> -->

        <el-form-item label="商品属性">
          <div v-for="(attr, index) in form.attributes" :key="index" class="attribute-item">
            <el-select v-model="attr.attrId" placeholder="请选择属性">
              <el-option
                v-for="item in attributeOptions"
                :key="item.id"
                :label="item.attrName"
                :value="item.id"
              />
            </el-select>
            <el-input v-model="attr.attrValue" placeholder="请输入属性值" />
            <el-button type="danger" @click="removeAttribute(index)">删除</el-button>
          </div>
          <el-button type="primary" @click="addAttribute" style="margin-left: 20px;">添加属性</el-button>
        </el-form-item>
       
        <!-- 运费模板功能已移除 -->
        <el-form-item label="上架状态">
          <el-switch v-model="form.state" :active-value="0" :inactive-value="1" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input
            v-model="form.productIntro"
            type="textarea"
            :rows="6"
            placeholder="请输入商品描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="SPU管理">
          <div v-for="(spu, index) in form.spuList" :key="index" class="spu-item">
            <div class="spu-basic-info">
              <el-input v-model="spu.spuName" placeholder="规格名称" style="width: 150px; margin-right: 10px;" />
              <el-input v-model="spu.spuValue" placeholder="规格值" style="width: 150px; margin-right: 10px;" />
              <el-input-number v-model="spu.spuPrice" :precision="2" :step="0.1" :min="0" placeholder="售价" style="margin-right: 10px; width: 150px;" controls-position="right" />
              <el-input-number v-model="spu.spuStock" :min="0" placeholder="库存" style="margin-right: 10px; width: 150px;" controls-position="right" />
              上下架状态：<el-switch v-model="spu.state" :active-value="0" :inactive-value="1" style="margin-right: 10px;" />
              <el-button type="danger" @click="removeSpu(index)">删除</el-button>
            </div>
            <div class="spu-images" style="margin-top: 10px;">
              <span style="margin-right: 10px;">SPU图片：</span>
              <el-upload
                class="spu-images-uploader"
                action="/api/upload"
                list-type="picture-card"
                :http-request="(options) => handleSpuImagesUpload(options, index)"
                :on-remove="(file) => handleSpuImageRemove(file, index)"
                :file-list="(spu.spuImages || []).map(url => ({
                  url: processImageUrl(url),
                  name: url.split('/').pop()
                }))"
                multiple
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </div>
          </div>
          <el-button type="primary" @click="addSpu" style="margin-left: 50px;">添加SPU</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getProductDetail, addProduct, updateProduct } from '@/api/productsApi'
import { getCategoryList } from '@/api/categoriesApi'
import { getSpecDictList } from '@/api/specDictApi'
import { uploadImage } from '@/api/uploadApi'
import { getAttributeList } from '@/api/attributeApi'
// 运费模板API已移除
import { processImageUrl } from '@/utils/imageUtils'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const categoryOptions = ref([])
const specDictOptions = ref([])

const form = ref({
  productId: '',
  productName: '',
  productTitle: '',
  categoryId: '',
  categoryPath: [],
  skuConfigIds: [],
  productPicture: '',
  productImages: [],
  productIntro: '',
  state: 1,
  attributes: [],
  // shippingTemplateId: '', // 运费模板功能已移除
  spuList: []
})

const attributeOptions = ref([])
// const shippingTemplateOptions = ref([]) // 运费模板功能已移除

// 获取规格字典列表
const fetchSpecDict = async () => {
  try {
    const res = await getSpecDictList()
    specDictOptions.value = res
  } catch (error) {
    ElMessage.error('获取标签字典失败')
  }
}

// 获取商品分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    // 将平铺的类目数据转换为树形结构
    categoryOptions.value = buildCategoryTree(res)
  } catch (error) {
    ElMessage.error('获取商品分类失败')
  }
}

// 构建类目树形结构
const buildCategoryTree = (categories) => {
  const categoryMap = new Map()
  const rootCategories = []
  
  // 先将所有类目放入Map中
  categories.forEach(category => {
    categoryMap.set(category.categoryId, { ...category, children: [] })
  })
  
  // 构建树形结构
  categories.forEach(category => {
    if (category.categoryLevel === 1) {
      // 一级类目
      rootCategories.push(categoryMap.get(category.categoryId))
    } else if (category.categoryLevel === 2) {
      // 二级类目，找到父类目并添加到children中
      const parent = categoryMap.get(category.parentCategoryId)
      if (parent) {
        parent.children.push(categoryMap.get(category.categoryId))
      }
    }
  })
  
  return rootCategories
}

// 处理类目选择变化
const handleCategoryChange = (value) => {
  form.value.categoryId = value
}

// 获取商品详情
const fetchProductDetail = async (id) => {
  try {
    const res = await getProductDetail(id)
    form.value = res
    // 如果有categoryId，需要设置categoryPath用于级联选择器显示
    if (res.categoryId) {
      // 需要根据categoryId找到完整的路径
      await setCategoryPath(res.categoryId)
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
  }
}

// 根据categoryId设置完整的categoryPath
const setCategoryPath = async (categoryId) => {
  try {
    // 获取所有类目数据
    const categories = await getCategoryList()
    
    // 找到当前类目
    const currentCategory = categories.find(cat => cat.categoryId === categoryId)
    
    if (currentCategory) {
      if (currentCategory.categoryLevel === 1) {
        // 一级类目，直接设置
        form.value.categoryPath = [categoryId]
      } else if (currentCategory.categoryLevel === 2) {
        // 二级类目，需要包含父类目ID和当前类目ID
        form.value.categoryPath = [currentCategory.parentCategoryId, categoryId]
      }
    }
  } catch (error) {
    console.error('设置类目路径失败:', error)
    // 如果获取失败，至少设置当前categoryId
    form.value.categoryPath = [categoryId]
  }
}

const handleUpload = async (options) => {
  try {
    const res = await uploadImage( options.file)
    form.value.productPicture = res
    options.onSuccess()
  } catch (error) {
    options.onError()
    ElMessage.error('上传失败')
  }
}

const handleProductImagesUpload = async (options) => {
  try {
    const res = await uploadImage(options.file)
    form.value.productImages.push(res)
    options.onSuccess()
  } catch (error) {
    options.onError()
    ElMessage.error('上传失败')
  }
}

const handleRemove = (file) => {
  const fileUrl = file.url || file
  const index = form.value.productImages.indexOf(fileUrl)
  if (index !== -1) {
    form.value.productImages.splice(index, 1)
  }
}

const handleSubmit = async () => {
  try {
    // 验证SPU数据
    if (form.value.spuList.length === 0) {
      ElMessage.warning('请至少添加一个SPU')
      return
    }
    for (const spu of form.value.spuList) {
      if (!spu.spuName || !spu.spuValue || !spu.spuPrice || !spu.spuStock) {
        ElMessage.warning('请完善SPU信息')
        return
      }
    }

    if (isEdit.value) {
      await updateProduct(form.value.productId, form.value)
      ElMessage.success('更新成功')
    } else {
      await addProduct(form.value)
      ElMessage.success('添加成功')
    }
    goBack()
  } catch (error) {
    console.error(error)
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

const goBack = () => {
  router.push('/products')
}

// 获取属性字典列表
const fetchAttributes = async () => {
  try {
    const res = await getAttributeList()
    attributeOptions.value = res
  } catch (error) {
    ElMessage.error('获取属性字典失败')
  }
}

// 添加属性
const addAttribute = () => {
  form.value.attributes.push({
    attrId: '',
    attrValue: ''
  })
}

// 删除属性
const removeAttribute = (index) => {
  form.value.attributes.splice(index, 1)
}

// 添加SPU
const addSpu = () => {
  form.value.spuList.push({
    spuName: '',
    spuValue: '',
    spuPrice: null,
    spuStock: null,
    state: 0,
    spuImages: []
  })
}

// 删除SPU
const removeSpu = (index) => {
  form.value.spuList.splice(index, 1)
}

// SPU图片上传
const handleSpuImagesUpload = async (options, spuIndex) => {
  try {
    const res = await uploadImage(options.file)
    if (!form.value.spuList[spuIndex].spuImages) {
      form.value.spuList[spuIndex].spuImages = []
    }
    form.value.spuList[spuIndex].spuImages.push(res)
    options.onSuccess()
  } catch (error) {
    options.onError()
    ElMessage.error('上传失败')
  }
}

// SPU图片删除
const handleSpuImageRemove = (file, spuIndex) => {
  const fileUrl = file.url || file
  const images = form.value.spuList[spuIndex].spuImages || []
  const index = images.indexOf(fileUrl)
  if (index !== -1) {
    form.value.spuList[spuIndex].spuImages.splice(index, 1)
  }
}

// 获取运费模板列表功能已移除

onMounted(() => {
  const productId = route.params.id

  if (productId && productId !== 'new') {
    isEdit.value = true
    fetchProductDetail(productId)
  }
  fetchCategories()
  fetchSpecDict()
  fetchAttributes()
  // fetchShippingTemplates() // 运费模板功能已移除
})
</script>

<style scoped>
.product-edit-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spu-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.spu-basic-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.spu-images {
  display: flex;
  align-items: flex-start;
}

.spu-images-uploader {
  .el-upload--picture-card {
    width: 80px;
    height: 80px;
    margin: 0 8px 8px 0;
  }
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

.product-images-uploader {
  .el-upload--picture-card {
    width: 100px;
    height: 100px;
    margin: 0 8px 8px 0;
  }
}

.attribute-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.attribute-item .el-select {
  width: 30%;
  margin-right: 20px;
}

.attribute-item .el-input {
  width: 50%;
  margin-right: 20px;
}


</style>