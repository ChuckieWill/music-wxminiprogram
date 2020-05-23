// components/w-progressbar/w-progressbar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //当前的秒数
let duration = 0 //当前播放音乐的总时长  以秒为单位
let isMoving = false //false表示当前没有拖动   isMoving用于解决拖拽与onTimeUpdate设置data中的值的冲突  相当于一把锁  
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,
    progress: 0,
  },

  // 生命周期函数
  lifetimes: {
    ready() {
      if(this.data.showTime.totalTime == '00:00'){
        this.setTime()
      }
      this.getMovableDis()
      this.bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //------------------------事件处理函数--------------------
    //拖动
    onChange(event){
      //console.log(event)
      if(event.detail.source == 'touch'){
        this.data.movableDis = event.detail.x ,
        //this.data.progress = event.detail.x/movableAreaWidth * 100
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        isMoving = true
        console.log(isMoving, 'change' )
      }
    },
    //拖动结束
    onTouchEnd(){
      //获取当前时间
      //const currentTimeFmt = this.dateFormat(backgroundAudioManager.currentTime)
      this.setData({
        movableDis: this.data.movableDis,
        progress: this.data.progress,
        //['showTime.currentTime'] : currentTimeFmt.min + ':'+currentTimeFmt.sec
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false               //此处有Bug
      console.log(isMoving, 'end')
    },

    //------------------------数据设置函数--------------------
    //获取可滑动的距离
    getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        console.log(movableAreaWidth, movableViewWidth)
      })
    },

    //对音乐状态的相关操作
    bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        //向调用页面发出后台操作打开音乐的信息
        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        //向调用页面发出后台操作暂停音乐的信息
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        //duration的返回值不稳定  有时候是‘undefined’ 所以需要判断
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this.setTime()
        } else {
          setTimeout(() => {
            this.setTime()
          }, 1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {
        //console.log('onTimeUpdate')
        if(!isMoving){
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          //判断避免重复setData
          if (currentTime.toString().split('.')[0] != currentSec) {
            const currentTimeFmt = this.dateFormat(currentTime)
            this.setData({
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100
            })
            currentSec = currentTime.toString().split('.')[0]

            //歌词联动  将当前播放事件传给w-lyric
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        } 
      })

      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        this.triggerEvent("musicEnd")
      })

      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },


    //------------------------工具类函数--------------------
    //设置播放总时间
    setTime() {
      //duration 为全局变量
      duration = backgroundAudioManager.duration
      const durationFmt = this.dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    //格式化时间
    dateFormat(sec) {
      //分钟
      const min = Math.floor(sec / 60)
      //秒
      sec = Math.floor(sec % 60)
      return {
        'min': this.parse0(min),
        'sec': this.parse0(sec),
      }
    },
    //补零
    parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})