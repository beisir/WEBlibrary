/**
 * Created by xyh on 2017/8/7.
 */

(function () {

    function initialize(options) {

        /**
         * 弹框页面结构
         * @type {[*]}
         */
        var alertHtml = ['<div class="ieBox">',
            '<div class="alertCon">',
            '<div class="alertBorder"></div>',
            '<div class="proTop">',
            '<h2>提示</h2>',
            '<a id="closeBtn"></a>',
            '</div>',
            '<div class="proBox">',
            '<h3>你知道你的Internet Explorer过时了吗?</h3>',
            '<p>为了让您得到最好的体验效果,我们建议您升级到最新版本的IE浏览器或选择其他浏览器.推荐给大家几款牛逼的浏览器吧！</p>',
            '</div>',
            '<div class="lBoxIco">',
            '<a href="//www.google.cn/chrome/browser/desktop/index.html" class="chrome" target="_blank">chrome</a>',
            '<a href="//windows.microsoft.com/zh-cn/internet-explorer/download-ie" class="IE" target="_blank">IE</a>',
            '<a href="//se.360.cn/" class="l360" target="_blank">360安全</a>',
            '<a href="//www.firefox.com.cn/" class="huohu" target="_blank">火狐</a>',
            '<a href="//ie.sogou.com/" class="sougou" target="_blank">搜狗</a>',
            '<a href="//browser.qq.com/" class="LQQ" target="_blank">QQ</a>',
            '</div>',
            '</div>',
            '</div>',
            '<div class="ieBg"></div>'
        ];

        /**
         * IE支持的最低版本号
         * @type {Number}
         */
        var versionNo = parseInt(options.support.substring(options.support.length-1,options.support.length));

        /**
         * 当小于最低版本号时，添加弹框提示
         */
        if ($.browser && $.browser.msie  && parseInt($.browser.version) < versionNo) {
            $(alertHtml.join('')).appendTo('body');
        }


    }

    $.fn.IEAlert = function (options) {

        var defaults = {
            support: "ie9"  //默认支持的IE版本，即IE9以上版本
        };

        var option = $.extend(true,{},defaults,options);

        return this.each(function () {
            if($.browser && $.browser.msie){
                initialize(option);
            }
        });

    };

    $(function () {
        $('body').IEAlert();
        $('.proTop  #closeBtn').on('click',function () {
            $('.ieBox,.ieBg').remove();
            window.close();
        })
    })

})(jQuery);

