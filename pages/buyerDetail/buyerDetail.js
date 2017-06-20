// pages/buyerDetail/buyerDetail.js
var { statusList, statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    uncoverCls: '',
    baseInfo: {},
    extInfo: {},
    commentList: [],
    commentCount: 0,
    commentHasMore: true
    /*
    baseInfo: {         // 任意状态下的需求都应该返回的固定字段
      publishTime: '2017-05-08',        // 需求发布时间
      responseTime: '2017-05-09',       // 需求的抢单时间
      status: 1,                        // 需求状态，0为待响应，1为需求确认中，2为订单确认中，3为订单进行中，4为物流配送中，5为结款中，6为已完结，7为已终止
      alertType: 0,                     // 到期提醒，-1为无提醒，0为交货时间临近（少于3天提醒），1为结款时间临近（少于3天提醒）
      description: {
        content: '这里是文字描述',         // 需求描述文字
        pictures: [                   // 需求描述图片，最多为5张
          'http://xx.png',
          'http://yy.png'
				]
      },
      productType: '纸品',               // 所属一级品类名称
      isFollow: true,                   // 当前用户是否已经关注
      relatedRole: 0                    // 当前用户与对应需求的关联角色，-1为游客，0为发布该需求的采购人员，1为接受该需求的sku经理
    },
    extInfo: {          // 只有特定状态下才会维护进来的字段，没有时可以为空或不传
      title: '需求标题',                  // 需求标题，由sku经理维护
      buyerName: '张三',                 // 发布需求的采购人员名字
      buyerCompany: 'xxx公司',           // 采购人员公司名称
      buyerContact: '18697909687',      // 采购人员联系方式
      skuerName: '李四',                 // 接受需求的sku经理名字
      skuerCompany: 'yyy公司',           // sku经理的公司名称
      skuerContact: '18697909687',      // sku经理联系方式
      productName: '产品名称',           // 产品名称
      amount: 10000,                    // 采购数量
      totalPrice: 5000,                 // 采购订单总价
      deliveryDeadline: '2017-05-08',   // 交货时间节点
      paymentDeadline: '2017-05-10'     // 结款时间节点
    }
    */
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var rid = options.rid;
    this.setData({
      rid: rid
    });
    this.getRequirementDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCommentList();
  },

  getRequirementDetail: function() {
    var that = this;
    request({
      url: APIS.GET_REQUIREMENT_DETAIL,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: this.data.rid
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          baseInfo: data.baseInfo,
          extInfo: data.extInfo
        });
        that.setData({
          'baseInfo.statusText': statusListSimple[data.baseInfo.status + ''].text,
          'baseInfo.statusColor': statusListSimple[data.baseInfo.status + ''].color,
        });
        wx.hideLoading();
      },
      loginCallback: this.getRequirementDetail,
      realFail: function (msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  getCommentList: function() {
    var that = this;
    request({
      url: APIS.GET_COMMENT_LIST,
      data: {
        //sid: wx.getStorageSync('sid'),
        rid: this.data.rid,
        pageNum: 1,
        pageSize: 9999
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          commentList: data.list,
          commentCount: data.totalCount,
          commentHasMore: data.hasMore
        });
        wx.hideLoading();
      },
      //loginCallback: this.getRequirementDetail,
      realFail: function (msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },

  onOpenDesc: function() {
    this.setData({
      uncoverCls: 'bd-desc-detail-uncover'
    });
  },

  onToComment: function() {
    var d = this.data;
    var rid = d.rid;
    var title = d.extInfo.title || '';
    var status = d.baseInfo.status;
    wx.navigateTo({
      url: '../commentAdd/commentAdd?rid=' + rid + '&title=' + title + '&status=' + status,
    })
  },

  onPreviewComment: function(e) {
    var commentIndex = +e.target.dataset.index;
    var picUrl = e.target.dataset.url;
    
    wx.previewImage({
      current: picUrl, // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: this.data.commentList[commentIndex].pictures
    });
  },

  onPreviewDesc: function(e) {
    var picUrl = e.target.dataset.url;

    wx.previewImage({
      current: picUrl, // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: this.data.baseInfo.description.pictures
    });
  },

  onToggleFollow: function() {
    var that = this;
    var rid = this.data.rid;
    request({
      url: APIS.TOGGLE_FOLLOW,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: rid,
        type: this.data.baseInfo.isFollow ? 0 : 1
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          "baseInfo.isFollow": !that.data.baseInfo.isFollow
        });
      },
      loginCallback: this.onToggleFollow,
      realFail: function (msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  }
})