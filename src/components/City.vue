<template>
  <div class="city-selector">
    <el-select
      v-model="selectedProvince"
      placeholder="请选择省份"
      @change="handleProvinceChange"
    >
      <el-option
        v-for="item in provinces"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>

    <el-select
      v-model="selectedCity"
      placeholder="请选择城市"
      :disabled="!selectedProvince"
      @change="handleCityChange"
      class="ml-2"
    >
      <el-option
        v-for="item in cities"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>

    <el-select
      v-model="selectedArea"
      placeholder="请选择区县"
      :disabled="!selectedCity"
      @change="handleAreaChange"
      class="ml-2"
    >
      <el-option
        v-for="item in areas"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getCityList } from '@/api/cityApi'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const provinces = ref([])
const cities = ref([])
const areas = ref([])

const selectedProvince = ref(null)
const selectedCity = ref(null)
const selectedArea = ref(null)

// 获取省份列表
// 获取所有省市区数据并处理成级联结构
const fetchAllCityData = async () => {
  try {
    const response = await getCityList()
    if (response && Array.isArray(response)) {
      // 处理省份数据
      provinces.value = response.filter(item => item.parentId === 0)
      
      // 处理城市和区县数据
      const allCityData = response.reduce((acc, item) => {
        if (item.parentId !== 0) {
          if (!acc[item.parentId]) {
            acc[item.parentId] = []
          }
          acc[item.parentId].push(item)
        }
        return acc
      }, {})
      
      // 存储所有城市数据，用于级联选择
      window.cityData = allCityData
    }
  } catch (error) {
    console.error('获取城市数据失败:', error)
  }
}

// 处理省份选择变化
const handleProvinceChange = (value) => {
  selectedCity.value = null
  selectedArea.value = null
  cities.value = window.cityData[value] || []
  areas.value = []
}

// 处理城市选择变化
const handleCityChange = (value) => {
  selectedArea.value = null
  areas.value = window.cityData[value] || []
}

// 处理区县选择变化
const handleAreaChange = (value) => {
  emit('update:modelValue', value)
}

// 监听外部传入的值变化
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    // 根据区县ID反查省市区信息
    await reverseLocationLookup(newValue)
  }
}, { immediate: true })

// 根据区县ID反查省市区信息
const reverseLocationLookup = async (districtId) => {
  try {
    // 在所有城市数据中查找对应的区县
    for (const province of allCityData.value) {
      for (const city of province.children || []) {
        const district = (city.children || []).find(d => d.value === districtId)
        if (district) {
          // 找到匹配的区县，设置对应的省市区值
          selectedProvince.value = province.value
          selectedCity.value = city.value
          selectedDistrict.value = district.value
          
          // 更新城市和区县列表
          cityList.value = province.children || []
          districtList.value = city.children || []
          
          return
        }
      }
    }
  } catch (error) {
    console.error('反查省市区信息失败:', error)
  }
}

// 初始化加载省份列表
fetchAllCityData()
</script>

<style scoped>
.city-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-selector :deep(.el-select) {
  flex: 1;
  min-width: 100px;
  max-width: 160px;
}

.ml-2 {
  margin-left: 0;
}
</style>