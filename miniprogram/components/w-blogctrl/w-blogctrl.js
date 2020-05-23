// components/w-blogctrl/w-blogctrl.js
let userInfo = {} //用户信息  用于评论
let isAccept = false //用户是否允许接受订阅消息
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },

  //接受iconfont样式
  externalClasses:[
    'iconfont',
    'icon-fenxiang',
    'icon-pinglun'
  ],
  /**
   * 组件的初始数据
   */
  data: {
    modelShow: false, //授权框显示控制
    commShow: false, //评论框显示控制
    content: '',//评论输入的文字
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //-----------------------事件处理函数----------------------
    //点击评论
    onComment(){
      wx.getSetting({
        success: (res) => {
          //console.log(res)
          //如果用户已授权则scope.userInfo为true
          if(res.authSetting['scope.userInfo']){
            //获取用户信息
            wx.getUserInfo({
              success: (res) => {
                //console.log('已授权',res)
                userInfo = res.userInfo
                //显示评论框
                this.setData({
                  commShow: true
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

    //获取用户信息成功---login组件
    onLoginSuccess(event){
      //获取用户信息
      //console.log(event)
      userInfo = event.detail
      //1 授权框取消  
      this.setData({
        modelShow: false
      }, () => {
        //2 评论框显示
        this.setData({
          commShow: true
        })
      }) 
       
    },
    //获取用户信息失败---login组件
    onLoginFail(){
      wx.showModal({
        title: '授权用户才能进行评论',
        content: '',
      })
    },
    //评论输入
    onInput(event){
      //console.log(event.detail.value)
      this.setData({
        content: event.detail.value
      })
    },
    //发送评论
    onSend(){
      // 1 评论存入数据库
      //let formId = event.detail.formId
      //this.sendMessage()
      
      
    //  wx.getSetting({
    //     withSubscriptions: true,
    //     success: (res) => {
    //       console.log("getSetting详情", res)
    //       if (res.subscriptionsSetting.mainSwitch){
    //         isAccept = true
    //       }else{
    //         wx.requestSubscribeMessage({
    //           tmplIds: ['HQ_Jsw3hlgXoR1B7gqG2q_I51ot6watfHful90Q1LkQ'],
    //           success: (res) => {
    //             console.log("获取订阅消息授权", res)
    //             if (res.HQ_Jsw3hlgXoR1B7gqG2q_I51ot6watfHful90Q1LkQ == "accept"){
    //               isAccept = true
    //             }
    //           }
    //         })
    //       }
    //     }
    //   })
      


      
      
      let content = this.data.content
      if(content.trim() == ''){
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true,
      })
      db.collection('blog-comment').add({
        data: {
          content,//评论内容
          createTime: db.serverDate(), //创建时间
          blogId: this.properties.blogId, //评论的blog的_id
          nickName: userInfo.nickName, //用户名
          avatarUrl: userInfo.avatarUrl,//头像
        }
      }).then((res) => {
        // 2 推送订阅消息
        // if(isAccept){
        //   this.sendMessage()
        // }
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          commShow:false,
          //content: '' //清空输入框  与<textview>中的value="{{content}}"配合
        })

        //评论完后提醒父页面刷新评论列表
        this.triggerEvent('refreshCommentList')
      })
    },
    //----------------------网络请求函数-----------------
    //调用订阅消息云函数
    sendMessage(){
      let content = this.data.content
      //console.log(content)
      wx.cloud.callFunction({
        name: 'sendMessage',
        data: {
          content,
          createTime: '2019年10月1日 15: 01',
          blogId: this.properties.blogId
        }
      }).then((res) => {
        console.log('sendMessage云函数调用', res)
      }).catch((err) => {
        console.error(err)
      })
    }
  }
})
