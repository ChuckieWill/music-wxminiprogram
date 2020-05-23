// components/w-search/w-search.js
let keywords = '' //输入的关键词
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder:{
      type: String,
      value: '请输入关键词'
    }
  },

  // 接收组件传入的iconfont样式
  externalClasses: [
    'iconfont',
    'icon-sousuo',
  ],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //----------------------------事件处理函数--------------------------
    //获取输入的关键词
    onInput(event){
      //console.log(event.detail.value)
      keywords = event.detail.value
      //console.log(keywords)
    },
    onSearch(){
      this.triggerEvent('search',{
        keywords
      })
    },
  }
})
