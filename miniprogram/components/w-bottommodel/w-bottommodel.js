// components/w-bottommodel/w-bottommodel.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modelShow: Boolean  //控制底部弹出层是否显示
  },

  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true
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
    //------------------------事件处理---------------
    //关闭弹出层
    onClose(){
      this.setData({
        modelShow: false
      })
    }
  }
})
