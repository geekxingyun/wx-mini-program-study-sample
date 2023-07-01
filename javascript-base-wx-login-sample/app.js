// app.js
App({
  onLaunch() {
    if(this.globalData.debugFlag){
      console.log('app.js===>onLaunch() do start!')
    }
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 实现小程序启动时自动执行登录操作
    this.checkWxLogin(res => {
      // 如果已登录且 token有效则无需操作
      if (res.haveLoginFlag) {
        if(this.globalData.debugFlag){
          console.log('app.js===>当前用户已登录不需要重新登录')
        }
      } else {
        // 如果没登录或登录无效则需要重新登录
        this.wxLogin()
      }
    })
    if(this.globalData.debugFlag){
      console.log('app.js===>onLaunch() do end!')
    }
  },
  // 检查微信用户是否已登录且 token 有效没有过期
  checkWxLogin(callback) {
    var token = this.globalData.token
    if (!token) {
      // 如果 token不存在
      token = wx.getStorageSync('token')
      if(token){
        // 如果缓存中存在 token 则更新
        this.globalData.token= token
      }else{
        // 返回登录失败
        // 函数返回值 可理解成 return false
        callback({
          haveLoginFlag: false
        })
      }
    } 
    // 检查登录 token 是否有效
    var checkWxMiniProgramLoginUrl = this.globalData.developerServerBaseUrl + '/wxMiniProgramAppService/checkWxMiniProgramLogin.do'
      if (this.globalData.debugFlag) {
         console.log('app.js===>开始请求验证token是否有效接口地址URL:' + checkWxMiniProgramLoginUrl)
      }
      // 如果 token 存在 则校验 token是否有效 
      wx.request({
        url: checkWxMiniProgramLoginUrl,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data: {
          token: token
        },
        success: res => {
          // 函数返回值 可理解成 return 接口返回的登录状态
          callback({
            haveLoginFlag: res.data.haveLoginFlag
          })
        }
      })
  },
  wxLogin() {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (this.globalData.debugFlag) {
          console.log('app.js===>request wx login code:' + res.code);
        }
        var wxMiniProgramLoginUrl = this.globalData.developerServerBaseUrl + '/wxMiniProgramAppService/wxMiniProgramLogin.do';
        if (this.globalData.debugFlag) {
          console.log('app.js===>request login api url:' + wxMiniProgramLoginUrl);
        }
        wx.request({
          url: wxMiniProgramLoginUrl,
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            code: res.code
          },
          success: res => {
            var response = res.data
            if (response.code === 20000) {
              if(this.globalData.debugFlag){
                console.log('app.js===>微信登录成功');
                console.log('app.js===>打印当前用户登录token:' + response.data.token);
              }
              // 将 token 保存为公共数据 (用于多页面中访问)
              this.globalData.token = response.data.token
              if(this.globalData.debugFlag){
                console.log('app.js===>this.globalData.token=' + this.globalData.token)
              }
              // 将 token 保存到数据缓存 (下次打开小程序无需重新获取 token)
              wx.setStorage({
                key: 'token',
                data: this.globalData.token,
                success: res => {
                  if(this.globalData.debugFlag){
                    console.log('app.js===>用户登录token写入缓存成功')
                  }
                }// end success 
              })
            } else {
              if(this.globalData.debugFlag){
                console.log(response.message)
              }
            }
          }
        })
      }
    })
  },
  globalData: {
    // 调试打印信息
    debugFlag: true,
    // 开发者服务器基地址
    developerServerBaseUrl: 'https://www.your-server.com',
    // 将 token 保存为公共数据 (用于多页面中访问)
    token: null,
    // 是否已登录且 token有效
    haveLoginFlag: false,
    // 保存用户登录信息
    userInfo: null,
  }
})