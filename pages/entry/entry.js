// pages/entry/entry.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHidePage: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.roleType = wx.getStorageSync('roleType');
    if (this.roleType === '') {
      this.renderUI();
    } else {
      if (this.roleType == '0') {
        wx.redirectTo({
          url: '../buyerCenter/buyerCenter'
        });
      } else {
        wx.redirectTo({
          url: '../skuerList/skuerList'
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  renderUI: function() {
    this.setData({
      isHidePage: false
    });
  },

  onSelectRole: function(e) {
    this.roleType = e.target.dataset.type;
    wx.showLoading({
      title: '数据加载中...'
    });
    user.login(this.changeRole, this, true);
  },

  changeRole: function() {
    var that = this;
    request({
      url: APIS.CHANGE_IDENTITY,
      data: {
        sid: wx.getStorageSync('sid'),
        identityType: this.roleType
      },
      method: 'POST',
      realSuccess: function (data) {
        console.log(data);
        wx.setStorageSync('roleType', that.roleType);
        wx.hideLoading();
        if (that.roleType == '0') {
          wx.redirectTo({
            url: '../buyerCenter/buyerCenter'
          });
        } else {
          wx.redirectTo({
            url: '../skuerCenter/skuerCenter'
          });
        }
      },
      loginCallback: this.changeRole,
      realFail: function (msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  }
})