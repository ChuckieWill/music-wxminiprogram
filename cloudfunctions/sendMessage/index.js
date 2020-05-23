const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  console.log(event)
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: cloud.getWXContext().OPENID, // 通过 getWXContext 获取 OPENID
      page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
      lang: 'zh_CN',
      data: {
        thing2: {
          value: event.content
        },
        time4: {
          value: event.createTime
        },
      },
      templateId:'HQ_Jsw3hlgXoR1B7gqG2q_I51ot6watfHful90Q1LkQ',
      miniprogramState: 'developer',
    })
    // result 结构
    // { errCode: 0, errMsg: 'openapi.templateMessage.send:ok' }
    return result
  } catch (err) {
    // 错误处理
    // err.errCode !== 0
    throw err
  }
}