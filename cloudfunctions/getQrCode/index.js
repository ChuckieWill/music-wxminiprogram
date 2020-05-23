// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID,
    //pages:"pages/blog/blog",
    // lineColor: {
    //   'r': 211,
    //   'g': 60,
    //   'b': 57
    // },
    // isHyaline: true
  })
  //返回值是二进制----表示二维码
  //console.log(result)
  //上传云存储  将二进制数转化为图片
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() * 1000000 +'.png',
    fileContent: result.buffer,
  })
  //返回小程序端小程序码的云存储地址
  return upload.fileID
}