// miniprogram/pages/playlist/playlist.js
const db = wx.cloud.database()
const MAX_LIMIT = 15
Page({
  /**
   * 页面的初始数据
   */
  data: {
  //   {
  //   url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
  // },
  // {
  //   url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
  // },
  // {
  //   url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
  // } 
    swiperImgUrls:[],
    playList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPlaylist()
    this.getSwiper()
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
    this.setData({
      playList: []
    })
    this.getPlaylist()
    this.getSwiper()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getPlaylist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // -------------------网络请求函数-----------------------
  //获取歌单列表（playlist）数据
  getPlaylist(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        skip: this.data.playList.length,
        limit: MAX_LIMIT,
        $url: 'playlist'
      }
    })
      .then(res => {
        //console.log(res) 
        this.setData({
          playList: this.data.playList.concat(res.result.data)
        })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
      .catch(console.error)
  },
  //获取轮播图
  getSwiper(){
    db.collection('0swiper').get().then((res)=>{
      this.setData({
        swiperImgUrls: res.data
      })
    })
  }
})