import service from '@/utils/requests'

export function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return service({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': undefined // 让axios自动设置Content-Type和boundary
    }
  })
}