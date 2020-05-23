// components/w-login/w-login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modelShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //------------------------事件函数-----------------------
    onGotUserInfo(event){
      //console.log(event)
      //点击button 弹出获取用户权限的弹出框  选择“取消”或“允许”  选择后返回event
      const userInfo = event.detail.userInfo
      //如果选择“允许”---授权了
      if(userInfo){
        this.setData({
          modelShow: false
        })
        //将用户信息传给父页面
        this.triggerEvent('loginsuccess' , userInfo)
      }else{
        //将获取失败信息传出给页面
        this.triggerEvent('loginfail')
      }
    }
  }
})
