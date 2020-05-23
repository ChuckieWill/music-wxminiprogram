// components/w-musiclist/w-musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:{
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
  
  //组件所在页面的生命周期
  pageLifetimes: {
     // 页面被展示
    show () {
      this.setData({
        playingId: parseInt(app.getPlayMusicId())
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(events){
      console.log(events.currentTarget.dataset.musicid)
      const musicid = events.currentTarget.dataset.musicid
      const index = events.currentTarget.dataset.index
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicid=${musicid}&index=${index}`,
      })
    }
  }
})
