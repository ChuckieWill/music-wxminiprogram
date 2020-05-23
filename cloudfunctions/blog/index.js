// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')
const MAX_LIMIT = 100  //每次最大查询条数

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })
  
  //模糊查询
  app.router('list', async (ctx, next) => {
    const keyword = event.keyword
    let w = {}
    if (keyword.trim() != '') {
      w = {
        content: new db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    }

    let blogList = await blogCollection.where(w).skip(event.start).limit(event.count)
      .orderBy('createTime', 'desc').get().then((res) => {
        return res.data
      })
    ctx.body = blogList
  })


  //博客详情页 通过blogId 查询
  app.router('detail',async(ctx,next) => {
    const blogId = event.blogId
    //查询详情
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
    //查询评论
    const countResult = await blogCollection.count()
    const total = countResult.total
    let commentList ={
      data: []
    }
    if(total > 0){
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      let tasks = []
      for(i=0;i< batchTimes;i++){
        let promise = db.collection('blog-comment').skip(i*MAX_LIMIT)
        .limit(MAX_LIMIT)
        .where({blogId}).orderBy('createTime','desc').get()
        tasks.push(promise)
      }
      if(tasks.length > 0){
        commentList = (await Promise.all(tasks)).reduce((acc,cur) => {
          return acc.data.concat(cur.data)
        })
      }
    }
    ctx.body = {
      detail,
      commentList,
    }
  })

  //openid查询我的博客
  const openId = cloud.getWXContext().OPENID
  app.router('myblog' ,async(ctx,next) => {
    ctx.body = await blogCollection.where({
      _openid: openId
    }).skip(event.start).limit(event.count).orderBy('crateTime','desc')
    .get().then((res) => {
      return res.data
    })
  })
  return app.serve()
}