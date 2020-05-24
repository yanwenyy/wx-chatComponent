// components/chatRoom/chatRoom.js
const myaudio = wx.createInnerAudioContext();
const recorderManager = wx.getRecorderManager();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navTitle:{
      type:String,//显示在导航栏的名字
      value:''
    },
    wxsUrl: {
      type: String, //websocket地址
      value: ''
    },
    parameter: {
      type: Object, //需要传的参数
      value: {}
    },
    header: {
      type: Object, //需要传的header参数
      value: {}
    },
    protocols: {
      type: Array, //子协议数组
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight:'',//导航栏高度
    bgColor:'bg_green',
    color:'green',
    colorList:['green','red','yellow'],
    skin:false,
    list: [], //会话内容
    inputMsg: '',
    scrollTop: '',
    windowHeight: '',
    inputHeight: '',
    voiceStatus: false, //录音框显示状态
    voiceIng: false, //是否录音中
    addStatus: false, //附件框显示状态
    ps: false, //摄像头状态
    psBtn: false,
    psTimer: null,
    psCount: 1,
    psVideo:false,
    psVideoUrl:'',//拍摄的视频预览
    psVideoImg:'',//拍摄的视频封面
    fullPlay:false,//是否全屏播放
    map:false,//是否显示地图
  },

  ready: function (options) {
    console.log(options);
    var that=this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          statusBarHeight: res.statusBarHeight
        })
      }
    })
    
    this.setData({
      windowHeight: wx.getSystemInfoSync().windowHeight
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    back:function(){
      var myEventDetail = {"chatIng":false} // detail对象，提供给事件监听函数
      var myEventOption = { bubbles: true, composed: true } // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },
    //input框输入
    input: function (e) {
      this.setData({
        inputMsg: e.detail.value
      })
    },

    //发送按钮点击
    sendMsg: function () {
      // let  scrollHeight = wx.getSystemInfoSync().windowHeight;
      if (this.data.inputMsg != '') {
        var v = {
          content: this.data.inputMsg,
          type:'msg'
        }
        this.data.list.push(v);
        this.setData({
          inputMsg: '',
          list: this.data.list
        })
       
      } else {

      }
    },

    inputFocus(e) {
      // console.log('键盘弹起')
      var inputHeight = 0
      if (e.detail.height) {
        inputHeight = e.detail.height;
        this.setData({
          inputHeight: inputHeight,
          addStatus: false
        })
      }
    },
    inputBlur() {
      // console.log('键盘收起');
      this.setData({
        inputHeight: 0
      })
    },

    //录音按钮点击
    voiceClick: function () {
      this.setData({
        voiceStatus: !this.data.voiceStatus,
        inputHeight: 0,
        addStatus: false,
      })
    },

    //加号按钮点击
    addClick: function () {
      this.setData({
        addStatus: !this.data.addStatus,
        inputHeight: 0
      });
      wx.hideKeyboard();
    },

    //开始录音
    record: function (e) {
      console.log("开始了");
      var that = this;

      recorderManager.start({
        audioSource: "auto",
        format: "mp3"
      });
      recorderManager.onStart(function () {
        that.setData({
          voiceIng: true
        })
      })
    },
    //结束录音
    recordEnd: function (e) {
      console.log("结束了");
      var that = this;
      recorderManager.stop();
      recorderManager.onStop(function (res) {
        that.setData({
          voiceIng: false
        })
        var v = {
          voiceMsg: res.tempFilePath,
          duration: res.duration,
          aboutTime: Math.round(res.duration / 1000),
          type:'audio'
        };
        that.data.list.push(v);
        that.setData({
          list: that.data.list
        })
      });
    },

    //列表内容点击
    msgLick: function (e) {
      // console.log(e);
      var that = this;
      var target = e.currentTarget.dataset;
      if (target.voicemsg) {
        myaudio.src = target.voicemsg;
        myaudio.play();
        myaudio.onPlay(function () {
          that.data.list[target.index].start = true;
          that.setData({
            list: that.data.list
          })
        });
        myaudio.onEnded(function () {
          that.data.list[target.index].start = false;
          that.setData({
            list: that.data.list
          })
        })
      }
    },

    //相册点击
    xcClick: function () {
      var that=this;
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePaths = res.tempFilePaths;
          // console.log(res)
          var v = {
            imgUrl: tempFilePaths,
            type:'img'
          }
          that.data.list.push(v);
          that.setData({
            inputMsg: '',
            list: that.data.list,
            addStatus: !that.data.addStatus,
            inputHeight: 0
          })
        }
      })
    },

    //拍摄点击
    psClick: function () {
      this.setData({
        ps: true
      })
    },

    //开始拍摄
    psStart: function () {
      var that = this;
      this.setData({
        psBtn: true
      });
      const camera = wx.createCameraContext();
      camera.startRecord({
        timeoutCallback: function (res) {
          that.setData({
            psVideo:true,
            psVideoUrl:res.tempVideoPath,
            psVideoImg:res.tempThumbPath,
            ps:false
          })
        },
        success: (res) => {
          console.log(res)
        },
        fail: (res) => {
          console.log(res)
        }
      })
      this.data.psTimer = setInterval(function () {
        that.data.psCount++;
        console.log(that.data.psCount)
        if (that.data.psCount == 30) {
          that.data.psCount = 1;
          clearInterval(that.data.psTimer)
          that.data.psTimer = null;
        }
      }, 1000);
    },

    //停止拍摄
    psEnd: function () {
      var that=this;
      this.setData({
        psBtn: false
      });
      const camera = wx.createCameraContext();
      this.data.psCount = 1;
      clearInterval(this.data.psTimer)
      this.data.psTimer = null;
      camera.stopRecord({
        success: (res) => {
          that.setData({
            psVideo:true,
            psVideoUrl:res.tempVideoPath,
            psVideoImg:res.tempThumbPath,
            ps:false
          })
          
        },
        fail: (res) => {
          console.log(res)
        }
      })
    },

    //视频预览返回按钮点击
    videoPreBack: function () {
      this.setData({
        psVideo: false,
        psVideoUrl: '',
        psVideoImg: '',
        ps: true
      })
    },

    //视频预览完成按钮点击
    videoPreSub: function () {
      var that=this;
      var v = {
        videoUrl: this.data.psVideoUrl,
        videoImg:this.data.psVideoImg,
        type: 'video'
      };
      console.log(v.videoImg)
      that.data.list.push(v);
      that.setData({
        list: that.data.list,
        psVideo: false,
        psVideoUrl: '',
        psVideoImg: '',
        ps: false
      })
    },

    //视频全屏播放
    fullPlay:function(e){
      this.setData({
        fullPlay:true,
        psVideoUrl:e.currentTarget.dataset.url
      })
    },

    //图片点击预览
    preImg:function(e){
      console.log(e.currentTarget.dataset.url)
      wx.previewImage({
        urls: e.currentTarget.dataset.url, // 当前显示图片的http链接
      })
    },

    //定位点击
    postionClick:function(e){
      var that=this;
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        isHighAccuracy:true,
        success(res) {
          const latitude = res.latitude
          const longitude = res.longitude
          console.log(res)
          that.setData({
            map:true,
            longitude: longitude,
            latitude: latitude,
            markers: [{
              iconPath: "../img/marker.png",
              id: 0,
              latitude: latitude,
              longitude: longitude,
              width: 50,
              height: 50
            }],
          })
        }
      })
    },
    //发送位置
    sendPosition:function(e){
      var v={
        type:'map',
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        markers: [{
          iconPath: "../img/marker.png",
          id:this.data.list.length+1,
          latitude: this.data.latitude,
          longitude: this.data.longitude,
          width: 20,
          height: 20
        }],
      }
      this.data.list.push(v)
      this.setData({
        map: false,
        list:this.data.list,
        addStatus: !this.data.addStatus,
        inputHeight: 0
      })
    },

    //对话的地图点击
    listMapClick:function(e){
      var latitude=e.detail.latitude,
          longitude = e.detail.longitude;
      wx.openLocation({
        latitude,
        longitude,
        scale: 18
      })
    },

    //皮肤按钮点击
    skinClick:function(){
      this.setData({
        skin:true
      })
    },
    //皮肤列表点击
    skinChange:function(e){
      this.setData({
        color:e.currentTarget.dataset.color,
        bgColor: 'bg_' + e.currentTarget.dataset.color,
        skin:false
      })
    }

  },

  observers: {
    'list': function(list) {
      var that=this;
      this.createSelectorQuery().selectAll('.chat-list').boundingClientRect(function(rect) {
        that.setData({
          scrollTop: rect.length>0?that.data.scrollTop+(rect[rect.length-1].height*4):list.length * 3000,
          // padding:list[list.length-1].type=='img'?250:30
        })
      }).exec();
    }
  },
})