// =======获取歌单列表信息======首页=====音乐
// =======从第三方库（网易云）获取歌单信息  写入云数据库（后台）=====
const cloud = require('wx-server-sdk')

cloud.init()

const db = wx.cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  //1.获取云数据库的数据------------------获取大于100条数据
  // const playlistCloud = await playlistCollection.get() 
  // 1.1 获取集合记录条数   返回值为对象   =====count()方法
  const countResult = await playlistCollection.count()
  //console.log(countResult)
  // 1.2 获取集合记录条数   对象中的tatal属性记录了记录条数 
  const countTotal = countResult.total
  // 1.3 计算循环次数
  const batchTimes = Math.ceil(countTotal / MAX_LIMIT)
  // 1.4 定义promise.all任务数组
  const tasks = []
  // 1.5 循环获取数据
  for (let i = 0; i < batchTimes;i++){
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 1.6 定义云数据库获取数据的数组
  let playlistCloud = {
    data: []
  }
  // 1.7 利用promsie.all完成多项异步操作
  if(tasks.length > 0){
    playlistCloud = (await Promise.all(tasks)).reduce((acc,cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  //2.获取第三方数据库的数据
  const playlistServe = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  //console.log(playlist)
  //3.去重云数据库与第三方数据的数据  将新数据写入newPlaylist
  const newPlaylist = []
  for (let i = 0, len1 = playlistServe.length ;i<len1;i++){
    let flag = true
    for (let j = 0, len2 = playlistCloud.data.length;j<len2;j++ ){
      if (playlistServe[i].id === playlistCloud.data[j].id ){
        flag = false
        break
      }
    }
    if(flag){
      newPlaylist.push(playlistServe[i])
    }
  }
  //4.将新数据写入云数据库
  for (let i = 0, len = newPlaylist.length; i < len; i++) {
    await playlistCollection.add({
      data: {
        ...newPlaylist[i],
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  }

  return newPlaylist.length
}