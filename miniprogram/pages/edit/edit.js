const app = getApp();
var that = null;
Page({
  data: {
    img: null,
    text: "",
    inrule: false
  },
  onLoad() {
    that = this;
    this.setData({
      img: app.globalData.rundata.runimg,
      text: app.globalData.rundata.runtext,
      inrule: app.globalData.rundata.runinrule
    })
  },
  previewimg() {
    wx.previewImage({
      urls: [that.data.img]
    })
  },
  uploadimg() {
    this.oldimg = that.data.img;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success(res) {
        that.setData({
          img: res.tempFilePaths[0]
        });
        wx.showLoading({
          title: '上传中',
          mask: true
        })
        that.uploadtourl(res.tempFilePaths[0]);
      }
    })
  },
  uploadtourl(file) {
    wx.cloud.uploadFile({
      cloudPath: 'run/' + app.globalData.rundata.id + new Date().getTime() + '.png',
      filePath: file,
      success: res => {
        let fileimg = res.fileID;
        wx.cloud.callFunction({
          name: 'saveimg',
          data: {
            img: fileimg
          },
          success: res => {
            wx.hideLoading();
            if (res.result.code == 0) {
              wx.showToast({
                title: '上传成功'
              })
              that.setData({
                img: res.result.img
              })
            } else if (res.result.code == 1) {
              wx.showModal({
                title: '安全提示',
                content: '你上传的图片内容不安全，请更换图片上传或者重新尝试',
                showCancel: false
              })
              console.log(res.result.img)
              that.setData({
                img: res.result.img
              })
            } else {
              wx.navigateBack({
                delta: 1
              })
            }
          },
          fail: err => {
            console.log(err);
            wx.hideLoading();
            that.setData({
              img: that.oldimg
            })
            wx.showModal({
              title: '网络错误',
              content: '网络出现问题，请检查网络后重新尝试',
              showCancel: false
            })
            wx.cloud.deleteFile({
              fileList: [fileimg]
            })
          }
        });
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
        that.setData({
          img: that.oldimg
        })
        wx.showModal({
          title: '上传错误',
          content: '封面上传失败，请检查网络后重新尝试！',
          showCancel: false
        })
      }
    })
  },
  inmytext(e) {
    this.setData({
      text: e.detail.value
    })
  },
  startset(e) {
    this.setData({
      inrule: e.detail.value
    })
  },
  save(e) {
    wx.getUserProfile({
      desc: '用于运动排行展示',
      success(res) {
        wx.showLoading({
          title: "保存中",
          mask: true
        })
        wx.cloud.callFunction({
          name: "savetext",
          data: {
            text: that.data.text,
            inrule: that.data.inrule,
            Info: res.userInfo
          },
          success: res => {
            wx.hideLoading();
            if (res.result.code == 0) {
              wx.showToast({
                title: '保存成功',
              })
            } else {
              wx.showModal({
                title: '安全提示',
                content: '你输入的内容不安全，请改正内容或者重新尝试',
                showCancel: false
              })
            }
          },
          fail: err => {
            console.log(err);
            wx.hideLoading();
            wx.showModal({
              title: '网络错误',
              content: '网络出现问题，请检查网络后重新尝试',
              showCancel: false
            })
          }
        })
      },
      fail(e) {
        console.log(e)
        wx.showModal({
          title: "提示",
          content: '应用获取你的信息为了更好的展示处理信息，不会外泄你的数据'
        })
      }
    })
  }
})