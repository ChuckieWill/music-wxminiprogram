// pages/player/player.js
//========播放界面===========

//存储本地的歌曲列表的信息
let musiclist = []
//正在播放的歌曲的index值
let nowPlayingIndex = 0
//获取全局唯一背景音频管理器
const backgroundAudioManger = wx.getBackgroundAudioManager()
const app = getApp()  //操作全局变量
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:'',
    isPlaying: false, //false表示歌曲不播放
    isLyricShow : false, //false表示歌词不显示
    lyric : '' ,//歌词
    isSame: false ,//表示是否为同一首歌曲
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    //1 获取正在播放的歌曲的index值
    nowPlayingIndex = options.index
    //2 从本地获取歌曲列表信息
    musiclist = wx.getStorageSync('musiclist')
    //3 通过index值从musiclist中获取正在播放的歌曲的详情信息
    //  传入musicid  网络请求获取歌曲播放地址
    this.loadMusicDetail(options.musicid)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


//------------------------------事件处理函数---------------------------
//播放-暂停的切换
  togglePlaying(){
    //正在播放
    if(this.data.isPlaying){
      backgroundAudioManger.pause()
    }else{
      backgroundAudioManger.play()
    }
    //isPlaying 的值改变（取反）
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
//切换上一首
  onPrev(){
    nowPlayingIndex--
    //如果当前播放是第一首则上一首是最后一首
    if(nowPlayingIndex < 0){
      nowPlayingIndex = musiclist.length - 1
    }
    this.loadMusicDetail(musiclist[nowPlayingIndex].id)
   
  },
//切换下一首
  onNext(){
    nowPlayingIndex++
    //如果当前播放是最后一首则下一首是第一首
    if (nowPlayingIndex >= musiclist.length) {
      nowPlayingIndex = 0
    }
    this.loadMusicDetail(musiclist[nowPlayingIndex].id)
    
  },

//封面与歌词切换
  onChangeLyricShow(){
    this.setData({
      isLyricShow : !this.data.isLyricShow
    })
  },

//获取当前播放时间
  timeUpdate(event){
    //console.log(event.detail.currentTime)
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

//后台暂停音乐
  onPause(){
    this.setData({
      isPlaying: false
    })
  },
//后台开始播放音乐
  onPlay(){
    this.setData({
      isPlaying: true
    })
  },
//------------------------------获取数据函数---------------------------
//获取正在播放歌曲的详情信息
  loadMusicDetail(musicid){
    //判断是不是播放的同一首歌
    if(musicid == app.getPlayMusicId()){
      this.setData({
        isSame: true
      })
    }else{
      this.setData({
        isSame: false
      })
    }
    //如果不是同一首歌
    if(!this.data.isSame){
      //停止上一首歌
      backgroundAudioManger.pause()
    }
    //设置正在播放歌曲的musicId
    app.setPlayMusicId(musicid)
    //1 从本地获取的数据--------music中存储正在播放歌曲的详情信息
    let music = musiclist[nowPlayingIndex]
    //console.log(music)
    //设置上方标题
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl:music.al.picUrl,
      isPlaying: false   //页面启动时歌曲不播放
    })

    //2 从云函数（第三方）获取歌曲音频播放地址
    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId: musicid,
        $url: 'musicUrl', 
      }
    }).then((res) => {
      //console.log(res)
      console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)
      //若是vip歌曲则显示不可播放
      if (result.data[0].url == null){
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      //不是同一首则开始播放
      if(!this.data.isSame){
        backgroundAudioManger.src = result.data[0].url //开始播放
        backgroundAudioManger.title = music.name
        backgroundAudioManger.coverImgUrl = music.al.picUrl
        backgroundAudioManger.singer = music.ar[0].name
        backgroundAudioManger.epname = music.al.name
        //播放历史存入本地
        this.savePlayHistory()
      }
      
      this.setData({
        isPlaying: true   //设置src后开始播放
      })
      wx.hideLoading()

      //3.获取歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId: musicid,
          $url:'lyric',
        }
      }).then((res) => {
        //console.log(res)
        let lyric = "暂无歌词"
        const lrc = JSON.parse(res.result).lrc
        if(lrc){
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },
//播放历史存储在本地
savePlayHistory(){
  const openId = app.globalData.openId
  const music = musiclist[nowPlayingIndex]
  const history = wx.getStorageSync(openId)
  //去重
  let isHave = false
  for(let i=0 , len=history.length;i<len;i++){
    if(history[i].id == music.id){
      isHave = true
      break
    }
  }
  if(!isHave){
    history.unshift(music)
    wx.setStorage({
      key: openId,
      data: history,
    })
  }
}
})