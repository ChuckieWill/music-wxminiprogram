// miniprogram/pages/blog/blog.js
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modelShow: false,  //控制底部弹出层是否显示
    blogList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadBlogList()
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
      blogList: []
    })
    keyword = ''
    this.loadBlogList(this.data.blogList.length)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    console.log(event)
    const blog = event.target.dataset.blog
    return {
      title: blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`
      //imageUrl: ''
    }
  },

//----------------------------事件处理函数---------------------
//发布
  onPublish(){
    //获取用户授权信息
    wx.getSetting({
      success:(res) => {
        //console.log(res)
        //判断是否用户已授权
        if(res.authSetting['scope.userInfo']){
          //获取用户相关信息
          wx.getUserInfo({
            success: (res) => {
              //console.log(res)
              //虽然是组件的事件函数参数但是只要传入的参数、参数类型、参数名一致都可以调用
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        }else{
          this.setData({
            modelShow: true
          })
        }
      }
    })
  },

  //用户授权成功
  onLoginSuccess(event){
    //console.log(event)
    //将用户头像和用户名传递给发布编辑页
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })

  },
  //用户授权失败
  onLoginFail(){
    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  },
  //跳转至评论详情页
  goComment(event){
    //console.log(event)
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.currentTarget.dataset.blogid}`
    })
  },
  //搜索处理函数
  onSearch(event){
    console.log(event.detail.keywords)
    keyword = event.detail.keywords
    //清空blog列表
    this.setData({
      blogList: []
    })
    //重新请求数据
    this.loadBlogList(this.data.blogList.length)

  },

  //----------------------------网络请求函数---------------------
  loadBlogList(start = 0){
    wx.showLoading({
      title: '拼命加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data:{
        start,
        keyword,
        count: 10,
        $url: 'list',
      }
    }).then((res) => {
      //console.log(res)
      this.setData({
        blogList : this.data.blogList.concat(res.result)
      })
      console.log('blog列表查询结果',this.data.blogList)
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
})