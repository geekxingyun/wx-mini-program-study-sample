// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    console.log('index.js===>onLoad() method do start ')
    // <open-data>组件功能调整
    // 为优化用户体验，平台将于2022年2月21日24时起回收通过<open-data>展示个人信息的能力。如有使用该技术服务，
    // 请开发者及时对小程序进行调整，避免影响服务流程。
    // 查看详情：https://developers.weixin.qq.com/community/develop/doc/000e881c7046a8fa1f4d464105b001
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  fetchWxUserInfo() {
    var tokenParam = null
    wx.getStorage({
      key: "token",
      success: res => {
        if(app.globalData.debugFlag){
          console.log('index.js===>从缓存中取出来用户token成功,token:' + JSON.stringify(res.data))
        }
        tokenParam = res.data
        if (tokenParam) {
          var fetchWxUserInfoUrl = app.globalData.developerServerBaseUrl + '/wxMiniProgramAppService/fetchWxUserInfo.do'
          if(app.globalData.debugFlag){
            console.log('index.js===>根据 token获取登录用户信息请求参数:token=' + tokenParam)
            console.log('index.js===>根据 token获取登录用户信息请求URL=' + fetchWxUserInfoUrl)
          }
          // 根据 token 获取用户信息
          wx.request({
            url: fetchWxUserInfoUrl,
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            data: {
              token: tokenParam
            },
            success: res =>{
              var response = res.data
              if(app.globalData.debugFlag){
                console.log('index.js===>根据token获取登录用户信息返回结果:' + JSON.stringify(response))
              }
              if (response.code === 20000) {
                this.userInfo = response.data
                if(app.globalData.debugFlag){
                  console.log('index.js===>用户昵称:' + this.userInfo.nickName)
                  this.setData({
                    userInfo: response.data,
                    hasUserInfo: true
                  })
                }
              } else {
                if(app.globalData.debugFlag){
                  console.log('index.js===>根据token获取登录用户信息失败返回结果:' + response.message)
                }
              }
            }
          })
        }
      },
      fail(res) {
        if(app.globalData.debugFlag){
          console.log('index.js===>中取出来用户token失败:' + JSON.stringify(res.data))
        }
      }
    })

  }
})
