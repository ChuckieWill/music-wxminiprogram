// components/w-blogcard/w-blogcard.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object
  },

  observers:{
    ['blog.createTime'](value){
      if(value){
        this.setData({
          _createTime: formatTime(new Date(value))
        })
      }
    }
  }, 

  /**
   * 组件的初始数据
   */
  data: {
    _createTime: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //----------------------------事件处理函数---------------------
    onPreviewImage(event){
      const ds = event.target.dataset
      wx.previewImage({
        urls: ds.imgs,
        current: ds.imgsrc,
      })
    }
  }
})
