// components/chatList/chatList.js
const app=getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
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
    chatIng: false,
    list:[],
    navTitle:'',//聊天者的名字
  },

  ready: function (options) {
    // console.log(options);
    var that = this;
    console.log(app.globalData.userInfo)
    var v={
      userInfo: app.globalData.userInfo
    }
    that.data.list.push(v);
    wx.getSystemInfo({
      success(res) {
        that.setData({
          statusBarHeight: res.statusBarHeight,
          chatIng:false,
          list:that.data.list
        })
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    back:function(){
      wx.navigateBack();
    },
    goRoom:function(e){
      this.setData({
        chatIng:!this.data.chatIng,
        navTitle:e.currentTarget.dataset.name
      })
    },

    //onMyEvent
    onMyEvent: function (e) {
     this.setData({
       chatIng: e.detail.chatIng
     })
    }
  }
})
