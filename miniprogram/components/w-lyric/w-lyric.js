// components/w-lyric/w-lyric.js
let lyricHeight = 0 //歌词在不同主机的高度（单位px）
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow : {
      type: Boolean,
      value: false
    },
    lyric : String

  },

  // 监听器
  observers:{
    lyric(lrc){
      if(lrc == "暂无歌词"){
        this.setData({
          lrcList:[{
            lrc,
            time: 0,
          }],
          nowLyricIndex: -1,//没有高亮
        })
      }else{
        this.parseLyric(lrc)   //解析歌词
      }
      console.log(lrc)     //字符串
      
    },
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [] , //歌词数组  时间+歌词
    nowLyricIndex: 0, //当前高亮显示的歌词的索引
    scrollTop: 0  //滚动条滚动的高度
  },

  // 生命周期
  lifetimes:{
    ready(){
      //宽度定为750rpx
      wx.getSystemInfo({
        success(res) {
          //console.log(res)
          //计算1rpx 等于 多少px -----*64 算出在这个主机上一行歌词的高度（单位px）
          lyricHeight = res.screenWidth / 750  * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //接受歌曲当前播放时间
    update(currentTime){
      //console.log(currentTime)
      let lrcList = this.data.lrcList
      //判断是否有歌词  没有则return
      if(lrcList.length == 0){
        return
      }
      //处理后面没有歌词的部分
      if (currentTime > lrcList[lrcList.length - 1].time){
        if(this.data.nowLyricIndex != -1){
          this.setData({
            nowLyricIndex : -1,  //没有歌词高亮显示
            scrollTop: (lrcList.length - 1) * lyricHeight,
          })
        }
      }
      for(let i=0,len = lrcList.length;i<len;i++){
        if (currentTime <= lrcList[i].time){
          this.setData({
            nowLyricIndex : i - 1,
            scrollTop: (i - 1) * lyricHeight,
          })
          break
        }
      }
      
    },

    //歌词解析
    parseLyric(sLyric){
      let line = sLyric.split('\n')  //数组  一句歌词一个元素  元素还是字符串
      //console.log(line)
      let _lrcList = []
      line.forEach((item) => {
        //截取时间部分
        let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        //console.log(time)
        if(time != null){
          //截取歌词部分
          let lrc = item.split(time)[1]   
          //console.log(item.split(time)[0],'0000',lrc)
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          //console.log(timeReg)
          //把时间转化成秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000

          _lrcList.push({
            lrc,                  //歌词
            time : time2Seconds   //时间（秒）
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
