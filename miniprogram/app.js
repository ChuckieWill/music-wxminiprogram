//app.js
App({
  onLaunch: function () {
    //检测并更新最新版本
    this.checkUpdate()
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'test-8h1rt',
        traceUser: true,
      })
    }
    //获取openid
    this.getOpenId()

    this.globalData = {
      playingMusicId : -1,
      openId : -1,
    }
  },
  //---------------------全局变量处理函数----------------------
  setPlayMusicId(playingMusicId){
    this.globalData.playingMusicId = playingMusicId
  },
  getPlayMusicId(){
    return this.globalData.playingMusicId
  },
  
  //---------------------数据处理函数--------------------------
  //获取openid 建立本地存储  存储音乐播放历史
  getOpenId(){
    wx.cloud.callFunction({
      name: 'login'
    }).then((res) => {
      //console.log(res)
      const openId = res.result.openid
      this.globalData.openId = openId
      if (wx.getStorageSync(openId) == ''){
        wx.setStorageSync(openId, [])
      }
    })
  },

  //---------------------系统处理函数--------------------------
  //检查版本更新情况并更新
  checkUpdate(){
    //全局版本管理器
    const updateManager = wx.getUpdateManager()
    //检测版本更新
    updateManager.onCheckForUpdate((res) => {
      //res.hasUpdate 表示有新版本
      if(res.hasUpdate){
        //下载新版本
        updateManager.onUpdateReady((res) => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用',
            success: (res) => {
              //提示选择“确定”
              if(res.confirm){
                //重启并应用新版本
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },
})
