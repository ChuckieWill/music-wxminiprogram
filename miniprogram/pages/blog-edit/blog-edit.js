// miniprogram/pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140 //文字输入最大数
const MAX_IMG_NUM = 9 //图片输入最大数
const db = wx.cloud.database()
let content = ''  //输入的文字内容
let fileIds = [] //存储云存储的图片的fileID
let userInfo = {} //存储用户头像及用户名
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0, //分析输入的字数
    footerBottom: 0, //处理键盘的跳出 footer位置的变化
    images: [] , //存储上传的图片
    selectPhoto : true  //添加图片元素是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userInfo = options
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

  //--------------------------事件函数---------------
  //textarea输入
  onInput(event){
    //console.log(event)
    let wordsNum = event.detail.value.length
    if(wordsNum >= MAX_WORDS_NUM){
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value //记录输入内容
  },
  //获取焦点
  onFocus(event){
    //console.log(event)
    this.setData({
      footerBottom: event.detail.height,
    })
  },
  //失去焦点
  onBlur(){
    this.setData({
      footerBottom: 0,
    })
  },
  //选择图片
  onChooseImage(){
    //计算当前最多还可上传图片数
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count : max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:(res) => {
        //console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        //图片超过9张后  选择图片模块不再显示
        if (this.data.images.length >= MAX_IMG_NUM){
          this.setData({
            selectPhoto: false
          })
        }
      }
    })
  },
  //删除图片
  onDelImage(event){
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    //若图片小于9张则再次显示  图片选择模块
    if (this.data.images.length < MAX_IMG_NUM){
      this.setData({
        selectPhoto: true
      })
    }
  },
  //预览图片
  onPreviewImage(event){
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },


  //发布
  send(){
    // 1、图片 -> 云存储 fileID 云文件ID
    // 2、数据 -> 云数据库
    // 数据库：内容、图片fileID、openid、昵称、头像、时间
    //若输入内容为空则不能发布
    if(content.trim() === ''){
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }

    wx.showLoading({
      title: '发布中',
      mask: true,      //出现遮罩层  showloading时用户点击不了其他操作
    })
    //存储promise
    let promiseArr = []
    //1 上传图片到云存储  获取fileID
    for(let i =0 ,len = this.data.images.length;i<len;i++){
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        //取到文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            //console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    //2 存入数据库
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo, //用户名、头像
          content,     //文字内容
          img : fileIds,//图片file ID
          createTime: db.serverDate(), //服务的时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })

        //返回父页  并刷新
        wx.navigateBack()
        //获取pages
        const pages = getCurrentPages()
        console.log(pages)
        //取到上一页
        const prevPage = pages[pages.length - 2]
        //调用上一页的下拉刷新函数
        prevPage.onPullDownRefresh()
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },

})