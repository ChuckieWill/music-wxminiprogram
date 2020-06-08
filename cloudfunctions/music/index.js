// ======从
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

const rp = require('request-promise')

const BASE_URL = ''

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

// 歌单列表路由
  app.router('playlist', async (ctx, next) => {
    ctx.body =  await cloud.database().collection('playlist')
      .skip(event.skip)
      .limit(event.limit)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  });

// 歌曲列表路由
  app.router('musiclist' , async(ctx,next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
      .then((res) => {
        return JSON.parse(res)
      })
  })

// 歌曲播放音频地址路由
  app.router('musicUrl' , async(ctx,next) => {
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`)
    .then((res) => {
      return res
    })
  })

//获取歌词
  app.router('lyric' , async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`)
    .then((res) => {
      return res
    })
  })
  
  return app.serve()
}


